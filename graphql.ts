import 'source-map-support/register';
import { ApolloServer, gql } from 'apollo-server-lambda';
import { IResolvers } from 'graphql-tools';
import { DocumentNode } from 'graphql';
import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient({
  region: process.env.AWS_DEFAULT_REGION,
  endpoint: 'http://dynamodb:8000',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const typeDefs: DocumentNode = gql`
  scalar JSON

  type Conversation {
    id: ID!
    trigger: String
    actions: [JSON!]!
    countable: Boolean
  }

  type Service {
    code: ID!
    isActive: Boolean!
    conversations: [Conversation!]!
  }

  type Query {
    services: [Service!]!

    service(
      code: String!
    ): Service!
  }

  type Mutation {
    updateServiceActive(
      code: String!
      isActive: Boolean!
    ): Service
    updateServiceConversations(
      code: String!
      conversations: [JSON!]!
    ): Service
  }
`;

const scanServices = async (): Promise<Array<object>> => {
  const TableName = 'botui-services';
  const results = await dynamodb.scan({ TableName }).promise();
  return results.Items;
};

interface getServiceInput {
  code: string
}

const getService = async ({ code }: getServiceInput): Promise<object> => {
  const TableName = 'botui-services';
  const Key = { code };
  const result = await dynamodb.get({ TableName, Key }).promise();
  return result.Item;
};

interface UpdateServiceInput {
  code: string,
  isActive?: boolean,
  conversations?: Array<object>
}

const updateService = async ({ code, ...input }: UpdateServiceInput): Promise<object> => {
  const TableName = 'botui-services';
  const Key = { code };
  const UpdateExpression = `SET ${Object.keys(input).map(key => `${key}=:${key}`).join(',')}`;
  const ExpressionAttributeValues = Object.keys(input).reduce((res, key) => ({ ...res, [`:${key}`]: input[key] }), {});
  const ReturnValues = 'ALL_NEW';
  const result = await dynamodb.update({ TableName, Key, UpdateExpression, ExpressionAttributeValues, ReturnValues }).promise();
  return result.Attributes;
};

const resolvers: IResolvers = {
  Query: {
    services: scanServices,
    service: (_, args) => getService(args),
  },
  Mutation: {
    updateServiceActive: (_, args) => updateService(args),
    updateServiceConversations: (_, args) => updateService(args),
  },
};

const server = new ApolloServer({ typeDefs, resolvers });

export const graphqlHandler = server.createHandler();
