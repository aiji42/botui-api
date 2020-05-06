import { APIGatewayProxyHandler } from 'aws-lambda';
import 'source-map-support/register';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: 'http://dynamodb:8000',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

export const getConversation: APIGatewayProxyHandler = async (event) => {
  const { pathParameters: { serviceCode } } = event;
  const result = await dynamodb.get({ TableName: 'botui-conversations', Key: { serviceCode } }).promise();

  if (!Object.keys(result).length) return { statusCode: 404, body: JSON.stringify({ message: `not found serviceCode: ${serviceCode}` }) };

  const { Item: { conversations } } = result;
  return {
    statusCode: 200,
    body: JSON.stringify(conversations, null, 2),
  };
};
