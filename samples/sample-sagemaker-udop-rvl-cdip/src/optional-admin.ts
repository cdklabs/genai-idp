import { IUserIdentity } from "@cdklabs/genai-idp";
import { CfnCondition, CfnParameter, Fn, Stack } from "aws-cdk-lib";
import {
  CfnUserPoolGroup,
  CfnUserPoolUser,
  CfnUserPoolUserToGroupAttachment,
} from "aws-cdk-lib/aws-cognito";
import { Construct } from "constructs";

export interface OptionalAdminUserProps {
  readonly userIdentity: IUserIdentity;
}

export class OptionalAdminUser extends Construct {
  constructor(scope: Construct, id: string, props: OptionalAdminUserProps) {
    super(scope, id);

    const adminEmail = new CfnParameter(Stack.of(this), "AdminEmail", {
      type: "String",
      default: "",
    });

    const shouldCreateAdmin = new CfnCondition(this, "CreateAdmin", {
      expression: Fn.conditionNot(
        Fn.conditionEquals(adminEmail.valueAsString, ""),
      ),
    });

    const adminUser = new CfnUserPoolUser(this, "AdminUser", {
      desiredDeliveryMediums: ["EMAIL"],
      userAttributes: [
        {
          name: "email",
          value: adminEmail.valueAsString,
        },
      ],
      username: adminEmail.valueAsString,
      userPoolId: props.userIdentity.userPool.userPoolId,
    });
    adminUser.cfnOptions.condition = shouldCreateAdmin;

    const adminGroup = new CfnUserPoolGroup(this, "AdminGroup", {
      description: "Administrators",
      groupName: "Admin",
      precedence: 0,
      userPoolId: props.userIdentity.userPool.userPoolId,
    });
    adminGroup.cfnOptions.condition = shouldCreateAdmin;

    const adminUserToAdminGroupAttachment =
      new CfnUserPoolUserToGroupAttachment(
        this,
        "AdminUserToAdminGroupAttachment",
        {
          groupName: adminGroup.ref,
          username: adminUser.ref,
          userPoolId: props.userIdentity.userPool.userPoolId,
        },
      );
    adminUserToAdminGroupAttachment.cfnOptions.condition = shouldCreateAdmin;
  }
}
