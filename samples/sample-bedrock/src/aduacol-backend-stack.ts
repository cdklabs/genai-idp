/**
 * ADUACOL IDP Backend Stack — Solo procesamiento de documentos
 *
 * Este stack despliega SOLO el pipeline de procesamiento (backend):
 * - VPC privada con VPC Endpoints
 * - S3 Buckets (input/output/working)
 * - Processing Environment (EventBridge, SQS, DynamoDB, Step Functions)
 * - Bedrock LLM Processor (Lambdas del pipeline)
 *
 * NO incluye (componentes de frontend):
 * - Cognito (UserIdentity)
 * - AppSync (ProcessingEnvironmentApi)
 * - CloudFront + WebApplication
 * - ProgressMonitor
 *
 * El sistema transaccional de ADUACOL interactúa directamente con S3:
 * 1. Sube PDFs al Input Bucket
 * 2. El pipeline procesa automáticamente (OCR → Clasificación → Extracción → Assessment)
 * 3. Lee los JSONs resultantes del Output Bucket
 */
import { ProcessingEnvironment } from "@cdklabs/genai-idp";
import {
  BedrockLlmProcessor,
  BedrockLlmProcessorConfiguration,
} from "@cdklabs/genai-idp-bedrock-llm-processor";

import { CfnOutput, RemovalPolicy, Stack } from "aws-cdk-lib";
import {
  GatewayVpcEndpointAwsService,
  InterfaceVpcEndpointAwsService,
  SubnetSelection,
  SubnetType,
  Vpc,
} from "aws-cdk-lib/aws-ec2";
import { ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Key } from "aws-cdk-lib/aws-kms";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import * as path from "path";

export class AduacolBackendStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    // ═══════════════════════════════════════════════════════════════════
    // 1. RED — VPC privada con endpoints para servicios AWS
    // ═══════════════════════════════════════════════════════════════════

    const vpc = new Vpc(this, "Vpc", {
      maxAzs: 2,
      createInternetGateway: false,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "isolated",
          subnetType: SubnetType.PRIVATE_ISOLATED,
        },
      ],
      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
          subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
        },
        DDB: {
          service: GatewayVpcEndpointAwsService.DYNAMODB,
          subnets: [{ subnetType: SubnetType.PRIVATE_ISOLATED }],
        },
      },
    });

    // VPC Endpoints — solo los necesarios para el backend (sin CODEBUILD)
    vpc.addInterfaceEndpoint("SSM", {
      service: InterfaceVpcEndpointAwsService.SSM,
    });
    vpc.addInterfaceEndpoint("CWLOGS", {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
    });
    vpc.addInterfaceEndpoint("CWMONITORING", {
      service: InterfaceVpcEndpointAwsService.CLOUDWATCH_MONITORING,
    });
    vpc.addInterfaceEndpoint("KMS", {
      service: InterfaceVpcEndpointAwsService.KMS,
    });
    vpc.addInterfaceEndpoint("BEDROCK", {
      service: InterfaceVpcEndpointAwsService.BEDROCK,
    });
    vpc.addInterfaceEndpoint("BEDROCKRUNTIME", {
      service: InterfaceVpcEndpointAwsService.BEDROCK_RUNTIME,
    });
    vpc.addInterfaceEndpoint("BEDROCKAGENTRUNTIME", {
      service: InterfaceVpcEndpointAwsService.BEDROCK_AGENT_RUNTIME,
    });
    vpc.addInterfaceEndpoint("STS", {
      service: InterfaceVpcEndpointAwsService.STS,
    });
    vpc.addInterfaceEndpoint("EVENTBRIDGE", {
      service: InterfaceVpcEndpointAwsService.EVENTBRIDGE,
    });
    vpc.addInterfaceEndpoint("LAMBDA", {
      service: InterfaceVpcEndpointAwsService.LAMBDA,
    });
    vpc.addInterfaceEndpoint("SQS", {
      service: InterfaceVpcEndpointAwsService.SQS,
    });
    vpc.addInterfaceEndpoint("SFN", {
      service: InterfaceVpcEndpointAwsService.STEP_FUNCTIONS,
    });
    vpc.addInterfaceEndpoint("TEXTRACT", {
      service: InterfaceVpcEndpointAwsService.TEXTRACT,
    });

    const vpcSubnets: SubnetSelection = {
      subnetType: SubnetType.PRIVATE_ISOLATED,
    };

    // ═══════════════════════════════════════════════════════════════════
    // 2. SEGURIDAD — KMS key para encriptación at-rest
    // ═══════════════════════════════════════════════════════════════════

    const key = new Key(this, "CustomerManagedEncryptionKey");
    key.grantEncryptDecrypt(new ServicePrincipal("logs.amazonaws.com"));

    // ═══════════════════════════════════════════════════════════════════
    // 3. ALMACENAMIENTO — Buckets S3
    // ═══════════════════════════════════════════════════════════════════

    // Input: el sistema transaccional de ADUACOL sube PDFs aquí
    const inputBucket = new Bucket(this, "InputBucket", {
      encryptionKey: key,
      eventBridgeEnabled: true,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Working: almacenamiento intermedio del pipeline
    const workingBucket = new Bucket(this, "WorkingBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // Output: JSONs de resultado que consume el sistema transaccional
    const outputBucket = new Bucket(this, "OutputBucket", {
      encryptionKey: key,
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    // ═══════════════════════════════════════════════════════════════════
    // 4. PROCESAMIENTO — Environment + Processor
    // ═══════════════════════════════════════════════════════════════════

    const metricNamespace = this.stackName;

    // Processing Environment: EventBridge rules, SQS, DynamoDB, Step Functions
    const environment = new ProcessingEnvironment(this, "Environment", {
      key,
      inputBucket,
      outputBucket,
      workingBucket,
      metricNamespace,
      vpcConfiguration: {
        vpc,
        vpcSubnets,
      },
    });

    // Bedrock LLM Processor: las Lambdas del pipeline (OCR, Classification, Extraction, Assessment)
    new BedrockLlmProcessor(this, "Processor", {
      environment,
      configuration: BedrockLlmProcessorConfiguration.fromFile(
        path.join(
          __dirname,
          "../../../sources/config_library/pattern-2/aduacol-customs/config.yaml"
        )
      ),
    });

    // ═══════════════════════════════════════════════════════════════════
    // 5. OUTPUTS — Información para integración del sistema transaccional
    // ═══════════════════════════════════════════════════════════════════

    new CfnOutput(this, "InputBucketName", {
      value: inputBucket.bucketName,
      description:
        "Bucket donde el sistema transaccional sube los PDFs a procesar",
    });

    new CfnOutput(this, "OutputBucketName", {
      value: outputBucket.bucketName,
      description:
        "Bucket donde el IDP deposita los JSONs con los campos extraídos",
    });

    new CfnOutput(this, "InputBucketArn", {
      value: inputBucket.bucketArn,
      description: "ARN del input bucket (para política IAM del transaccional)",
    });

    new CfnOutput(this, "OutputBucketArn", {
      value: outputBucket.bucketArn,
      description:
        "ARN del output bucket (para política IAM del transaccional)",
    });

    new CfnOutput(this, "KmsKeyArn", {
      value: key.keyArn,
      description:
        "ARN de la KMS key (el usuario IAM del transaccional necesita decrypt)",
    });
  }
}
