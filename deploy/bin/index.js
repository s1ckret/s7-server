#!/usr/bin/env node

import cdk from 'aws-cdk-lib';
import LambdaStack from '../lib/lambda.js';
import StorageStack from '../lib/storage.js';

const env = { account: '497404809514', region: 'eu-central-1' }
const serviceName = 's7-server'

const app = new cdk.App();
cdk.Tags.of(app).add('project', 's7');

new LambdaStack(app, `${serviceName}-lambda`, { env: env, serviceName: serviceName });

new StorageStack(app, `${serviceName}-storage`, { env: env, serviceName: serviceName });