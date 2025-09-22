import { App, Aspects, CfnResource, RemovalPolicy } from "aws-cdk-lib";
import { CfnUserPool } from "aws-cdk-lib/aws-cognito";
import { RvlCdipStack } from "./rvl-cdip-stack";

const app = new App();

new RvlCdipStack(app, "GenAI-IDP-SamplePattern3RvlCdip");

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
