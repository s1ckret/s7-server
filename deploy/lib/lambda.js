import { Stack } from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import cdk from 'aws-cdk-lib';

export default class LambdaStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    this.s7Lambda = new lambda.Function(this, `${props.serviceName}-lambda`, {
      functionName: `${props.serviceName}-lambda`,
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset('../app'),
    });

    const functionUrl = this.s7Lambda.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
    });

    new cdk.CfnOutput(this, 'FunctionUrlOutput', {
      value: functionUrl.url,
    });
  }

  /**
   * @return {lambda.Function}
   */
  getLambda() {
    return this.s7Lambda;
  }
}

