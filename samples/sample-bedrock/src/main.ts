import { App, Aspects, CfnResource, RemovalPolicy } from "aws-cdk-lib";
import { AduacolBackendStack } from "./aduacol-backend-stack";

const app = new App();

new AduacolBackendStack(app, "GenAI-IDP-ADUACOL");

// Clean up all the resources after deletion
Aspects.of(app).add({
  visit(node) {
    if (node instanceof CfnResource) {
      node.applyRemovalPolicy(RemovalPolicy.DESTROY);
    }
  },
});

app.synth();
