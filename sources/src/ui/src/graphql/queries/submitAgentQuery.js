// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { gql } from 'graphql-tag';

export default gql`
  query SubmitAgentQuery($query: String!, $agentIds: [String!]!) {
    submitAgentQuery(query: $query, agentIds: $agentIds) {
      jobId
      status
      query
      createdAt
    }
  }
`;
