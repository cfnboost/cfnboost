/**
 * To specify how AWS CloudFormation handles updates for the `MinSize`,
 * `MaxSize`, and `DesiredCapacity` properties when the
 * `AWS::AutoScaling::AutoScalingGroup` resource has an associated scheduled
 * action, use the `AutoScalingScheduledAction` policy.
 *
 * With scheduled actions, the group size properties of an Auto Scaling group
 * can change at any time. When you update a stack with an Auto Scaling group
 * and scheduled action, CloudFormation always sets the group size property
 * values of your Auto Scaling group to the values that are defined in the
 * `AWS::AutoScaling::AutoScalingGroup` resource of your template, even if a
 * scheduled action is in effect.
 *
 * If you don't want CloudFormation to change any of the group size property
 * values when you have a scheduled action in effect, use the
 * `AutoScalingScheduledAction` update policy and set
 * `IgnoreUnmodifiedGroupSizeProperties` to true to prevent CloudFormation from
 * changing the `MinSize`, `MaxSize`, or `DesiredCapacity` properties unless you
 * have modified these values in your template.
 *
 * @see https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-attribute-updatepolicy.html#cfn-attributes-updatepolicy-scheduledactions
 */

export interface AutoScalingScheduledActionPolicy {
  /**
   * If true, AWS CloudFormation ignores differences in group size properties
   * between your current Auto Scaling group and the Auto Scaling group
   * described in the `AWS::AutoScaling::AutoScalingGroup` resource of your
   * template during a stack update. If you modify any of the group size
   * property values in your template, AWS CloudFormation uses the modified
   * values and updates your Auto Scaling group.
   *
   * @default false
   */
  IgnoreUnmodifiedGroupSizeProperties?: boolean;
}
