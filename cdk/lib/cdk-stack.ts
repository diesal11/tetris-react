import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as cert from "aws-cdk-lib/aws-certificatemanager";
import * as cf from "aws-cdk-lib/aws-cloudfront";
import * as cfOrigins from "aws-cdk-lib/aws-cloudfront-origins";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as r53 from "aws-cdk-lib/aws-route53";
import * as r53Targets from "aws-cdk-lib/aws-route53-targets";

export class TetrisCertificateStack extends cdk.Stack {
  public readonly certificate: cert.Certificate;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const zone = r53.HostedZone.fromLookup(this, "DlundyAuZone", {
      domainName: "dlundy.au",
    });

    this.certificate = new cert.Certificate(this, "TetrisCertificate", {
      domainName: "tetris-react.dlundy.au",
      validation: cert.CertificateValidation.fromDns(zone),
    });
  }
}

export class TetrisStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    certStack: TetrisCertificateStack,
    props?: cdk.StackProps,
  ) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, "TetrisBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      bucketName: "tetris-react.dlundy.au",
      publicReadAccess: false,
    });

    const zone = r53.HostedZone.fromLookup(this, "DlundyAuZone", {
      domainName: "dlundy.au",
    });

    const distribution = new cf.Distribution(this, "TetrisDistribution", {
      defaultBehavior: {
        origin: cfOrigins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cf.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      domainNames: ["tetris-react.dlundy.au"],
      certificate: certStack.certificate,
      defaultRootObject: "index.html",
    });

    new r53.ARecord(this, "TetrisAliasRecord", {
      zone: zone,
      target: r53.RecordTarget.fromAlias(
        new r53Targets.CloudFrontTarget(distribution),
      ),
      recordName: "tetris-react",
    });

    new r53.AaaaRecord(this, "TetrisAliasRecordV6", {
      zone: zone,
      target: r53.RecordTarget.fromAlias(
        new r53Targets.CloudFrontTarget(distribution),
      ),
      recordName: "tetris-react",
    });
  }
}
