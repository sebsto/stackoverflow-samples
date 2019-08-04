import cdk = require('@aws-cdk/core');

import sns = require('@aws-cdk/aws-sns');
import subs = require('@aws-cdk/aws-sns-subscriptions');

import lambda = require('@aws-cdk/aws-lambda');

export class CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    let fn = new lambda.Function(this, 'SODemoFunction', {
      runtime: lambda.Runtime.NODEJS_10_X,
      code: lambda.Code.asset('./src'),
      handler: 'index.handler'
    });

    const topic = new sns.Topic(this, 'SODemoTopic', {
      displayName: 'StackOverflow Demo'
    });
    topic.addSubscription(new subs.LambdaSubscription(fn));

  }
}
