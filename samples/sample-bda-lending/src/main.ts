import { App, Aspects, CfnResource, RemovalPolicy } from "aws-cdk-lib";
import { CfnUserPool } from "aws-cdk-lib/aws-cognito";
import { BdaLendingStack } from "./bda-lending-stack";

const app = new App();

new BdaLendingStack(app, "GenAI-IDP-Sample-Pattern1-BdaLending");

// INFO: clean up all the resources after deletion
Aspects.of(app).add({
  visit(node) {
    if (node instanceof CfnUserPool) {
      node.addPropertyOverride("DeletionProtection", "INACTIVE");
    }
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  },
});

app.synth();
