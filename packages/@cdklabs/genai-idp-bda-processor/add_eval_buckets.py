#!/usr/bin/env python3
import re
import sys

def add_evaluation_bucket(content):
    """Add evaluationBaselineBucket to BdaProcessor instantiations that don't have it."""
    
    # Pattern to match BdaProcessor instantiation
    pattern = r'(new BdaProcessor\([^,]+,\s*"[^"]+",\s*\{)([^}]+)(\}\);)'
    
    counter = [0]  # Use list to allow modification in nested function
    
    def replacer(match):
        prefix = match.group(1)
        props = match.group(2)
        suffix = match.group(3)
        
        # Check if evaluationBaselineBucket already exists
        if 'evaluationBaselineBucket' in props:
            return match.group(0)
        
        counter[0] += 1
        
        # Add evaluationBaselineBucket before the closing brace
        props_stripped = props.rstrip()
        if not props_stripped.endswith(','):
            props_stripped += ','
        
        # Generate unique bucket name
        processor_id_match = re.search(r'"([^"]+)"', match.group(0))
        processor_id = processor_id_match.group(1) if processor_id_match else f"Processor{counter[0]}"
        bucket_name = f"EvalBucket{processor_id}"
        
        new_props = f"{props_stripped}\n        evaluationBaselineBucket: new Bucket(stack, \"{bucket_name}\"),"
        
        return f"{prefix}{new_props}\n      {suffix}"
    
    return re.sub(pattern, replacer, content, flags=re.DOTALL), counter[0]

if __name__ == "__main__":
    filepath = sys.argv[1]
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Ensure Bucket is imported
    if 'Bucket' not in content or ('import' in content and 'Bucket' in content and 'aws-s3' not in content):
        # Add import after aws-cdk-lib imports
        if 'from "aws-cdk-lib/assertions"' in content:
            content = re.sub(
                r'(import.*from "aws-cdk-lib/assertions";)',
                r'\1\nimport { Bucket } from "aws-cdk-lib/aws-s3";',
                content
            )
    
    updated_content, count = add_evaluation_bucket(content)
    
    if count > 0:
        with open(filepath, 'w') as f:
            f.write(updated_content)
        print(f"Updated {filepath}: added {count} evaluation buckets")
    else:
        print(f"Skipped {filepath}: no updates needed")
