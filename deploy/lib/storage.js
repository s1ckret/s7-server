import { Stack, RemovalPolicy } from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

/**
 * CDK Stack to provision all DynamoDB tables for the application.
 */
export default class StorageStack extends Stack {
    /**
     * @param {Construct} scope
     * @param {string} id
     * @param {object} props
     * @param {string} props.serviceName - The logical name of the service (e.g., 'target-practice').
     * @param {object} props.lambda - The Lambda function (IGrantable) to grant permissions to.
     */
    constructor(scope, id, props) {
        super(scope, id, props);

        const { serviceName, lambda } = props;

        // Common configuration for all tables
        const commonTableProps = {
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.RETAIN,
        };

        // ------------------------------------------------------------------
        // 0. Table: sessions (Original table)
        // ------------------------------------------------------------------
        this.sessionsTable = new dynamodb.Table(this, `${serviceName}-sessions-table`, {
            tableName: `${serviceName}-sessions`,
            ...commonTableProps,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            description: `DynamoDB table for ${serviceName} service express sessions.`,
            timeToLiveAttribute: 'expires'
        });

        this.sessionsTable.grantReadWriteData(lambda);

        // ------------------------------------------------------------------
        // 1. Table: users
        // ------------------------------------------------------------------
        this.usersTable = new dynamodb.Table(this, `${serviceName}-users-table`, {
            tableName: `${serviceName}-users`,
            ...commonTableProps,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            description: `Stores user profiles for ${serviceName}.`,
        });

        this.usersTable.grantReadWriteData(lambda);

        // ------------------------------------------------------------------
        // 2. Table: drills
        // ------------------------------------------------------------------
        this.drillsTable = new dynamodb.Table(this, `${serviceName}-drills-table`, {
            tableName: `${serviceName}-drills`,
            ...commonTableProps,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            description: `Stores available training drills for ${serviceName}.`,
        });

        this.drillsTable.grantReadWriteData(lambda);

        // ------------------------------------------------------------------
        // 3. Table: submissions (with GSI)
        // ------------------------------------------------------------------
        this.submissionsTable = new dynamodb.Table(this, `${serviceName}-submissions-table`, {
            tableName: `${serviceName}-submissions`,
            ...commonTableProps,
            partitionKey: {
                name: 'date',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING
            },
            description: `Stores all training submissions for ${serviceName}.`,
        });

        this.submissionsTable.grantReadWriteData(lambda);

        // ------------------------------------------------------------------
        // 4. Table: leaderboard_by_drill
        // ------------------------------------------------------------------
        this.leaderboardByDrillTable = new dynamodb.Table(this, `${serviceName}-leaderboard-by-drill-table`, {
            tableName: `${serviceName}-leaderboard-by-drill`,
            ...commonTableProps,
            partitionKey: {
                name: 'drill_id',
                type: dynamodb.AttributeType.STRING
            },
            description: `Stores the best submission results per drill for ${serviceName}.`,
        });

        this.leaderboardByDrillTable.grantReadWriteData(lambda);

        // ------------------------------------------------------------------
        // 5. Table: leaderboard_by_user
        // ------------------------------------------------------------------
        this.leaderboardByUserTable = new dynamodb.Table(this, `${serviceName}-leaderboard-by-user-table`, {
            tableName: `${serviceName}-leaderboard-by-user`,
            ...commonTableProps,
            partitionKey: {
                name: 'user_id',
                type: dynamodb.AttributeType.STRING
            },
            sortKey: {
                name: 'drill_id',
                type: dynamodb.AttributeType.STRING
            },
            description: `Stores the personal best results for each user in ${serviceName}.`,
        });

        this.leaderboardByUserTable.grantReadWriteData(lambda);
    }
}