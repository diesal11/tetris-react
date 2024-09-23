#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { TetrisCertificateStack, TetrisStack } from "../lib/cdk-stack";

const app = new cdk.App();

const certStack = new TetrisCertificateStack(
  app,
  "TetrisReactCertificateStack",
  {
    env: { region: "us-east-1", account: process.env.CDK_DEFAULT_ACCOUNT },
    crossRegionReferences: true,
  },
);

new TetrisStack(app, "TetrisReactStack", certStack, {
  env: { region: "ap-southeast-2", account: process.env.CDK_DEFAULT_ACCOUNT },
  crossRegionReferences: true,
});
