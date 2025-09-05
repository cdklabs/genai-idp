// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const reprocessDocument = /* GraphQL */ `
  mutation ReprocessDocument($objectKeys: [String!]!) {
    reprocessDocument(objectKeys: $objectKeys)
  }
`;

export default reprocessDocument;
