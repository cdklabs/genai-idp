// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const processChanges = /* GraphQL */ `
  mutation ProcessChanges($objectKey: String!, $modifiedSections: [ModifiedSectionInput!]!) {
    processChanges(objectKey: $objectKey, modifiedSections: $modifiedSections) {
      success
      message
      processingJobId
    }
  }
`;

export default processChanges;
