/**
 * @typedef {FilterFunction|FilterSettings} FilterOptions
 */

/**
 * @callback FilterFunction
 * @param {any} val
 * @returns boolean
 */

/**
 * @typedef {'eq'|'neq'|'isnull'|'isnotnull'|'lt'|'lte'|'gt'|'gte'|'startswith'|'endswith'|'contains'|'doesnotcontain'|'isempty'|'isnotempty'} ConditionType
 */

/**
 * @typedef {'or'|'and'} LogicOperator
 */

/**
 * @typedef {{field: string, operator: ConditionType, value: any}} FilterCondition
 */

/**
 * @typedef {{}} FilterConditionGroup
 * @property {LogicOperator} logic
 * @property {FilterCondition[]} filters
 */

/**
 * @typedef {FilterCondition|FilterConditionGroup|FilterCondition[]} FilterSettings
 */