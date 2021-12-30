import { Fn, IntrinsicValue } from './Fn.js';

/**
 * Pseudo parameters are parameters that are predefined by AWS CloudFormation.
 * You don't declare them in your template. Use them the same way as you would a
 * parameter, as the argument for the Ref function.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html
 */
export class AwsParam {
  /**
   * Returns the AWS account ID of the account in which the stack is being
   * created, such as `123456789012`.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-accountid
   */
  public static get AccountId(): IntrinsicValue {
    return Fn.ref('AWS::AccountId');
  }

  /**
   * Returns the list of notification Amazon Resource Names (ARNs) for the
   * current stack.
   *
   * To get a single ARN from the list, use {@link Intrinsic.split}.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-notificationarns
   */
  public static get NotificationARNs(): IntrinsicValue {
    return Fn.ref('AWS::NotificationARNs');
  }

  /**
   * Removes the corresponding resource property when specified as a return
   * value in the `Fn::If` intrinsic function.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-novalue
   */
  public static get NoValue(): IntrinsicValue {
    return Fn.ref('AWS::NoValue');
  }

  /**
   * Returns the partition that the resource is in. For standard AWS Regions,
   * the partition is `aws`. For resources in other partitions, the partition is
   * `aws-partitionname`. For example, the partition for resources in the China
   * (Beijing and Ningxia) Region is `aws-cn` and the partition for resources in
   * the AWS GovCloud (US-West) region is `aws-us-gov`.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-partition
   */
  public static get Partition(): IntrinsicValue {
    return Fn.ref('AWS::Partition');
  }

  /**
   * Returns a string representing the Region in which the encompassing resource
   * is being created, such as `us-west-2`.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-region
   */
  public static get Region(): IntrinsicValue {
    return Fn.ref('AWS::Region');
  }

  /**
   * Returns the ID of the stack as specified with the aws cloudformation
   * create-stack command, such as
   * `arn:aws:cloudformation:us-west-2:123456789012:stack/teststack/51af3dc0-da77-11e4-872e-1234567db123`.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-stackid
   */
  public static get StackId(): IntrinsicValue {
    return Fn.ref('AWS::StackId');
  }

  /**
   * Returns the name of the stack as specified with the aws cloudformation
   * `create-stack` command, such as `teststack`.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-stackname
   */
  public static get StackName(): IntrinsicValue {
    return Fn.ref('AWS::StackName');
  }

  /**
   * Returns the suffix for a domain. The suffix is typically `amazonaws.com`,
   * but might differ by Region. For example, the suffix for the China (Beijing)
   * Region is `amazonaws.com.cn`.
   *
   * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html#cfn-pseudo-param-urlsuffix
   */
  public static get URLSuffix(): IntrinsicValue {
    return Fn.ref('AWS::URLSuffix');
  }
}
