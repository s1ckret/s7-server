import { Stack, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * Props interface for StorageStack
 * @typedef {object} StorageStackProps
 * @property {string} serviceName - The logical name of the service (e.g., 'SessionManager').
 * @property {object} env - Environment properties (e.g., { region: 'us-east-1' }).
 * @property {string} [stackName] - Optional stack name.
 */

/**
 * CDK Stack to provision the DynamoDB table for session storage.
 */
export default class StorageStack extends Stack {
    /**
     * @param {Construct} scope
     * @param {string} id
     * @param {StorageStackProps} props
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const { serviceName } = props;

        const table = new dynamodb.Table(this, `${serviceName}-sessions`, {
            tableName: `${serviceName}-sessions`,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.RETAIN,
            description: `DynamoDB table for ${serviceName} service express sessions.`,
            timeToLiveAttribute: 'expires'
        });
    }
}