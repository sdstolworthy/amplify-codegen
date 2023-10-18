import * as Mustache from 'mustache';
import generateAllOps, { GQLTemplateOp, GQLAllOperations, GQLTemplateFragment } from './generator';
import { buildSchema } from './generator/utils/loading';
import { getOperationPartial, getExternalFragmentPartial, templatePartials } from './generator/utils/templates';
export { buildSchema } from './generator/utils/loading';

export function generateGraphQLDocuments<INCLUDE_META extends boolean>(
  schema: string,
  options: {
    maxDepth?: number;
    useExternalFragmentForS3Object?: boolean;
    typenameIntrospection?: boolean;
    includeMetaData?: INCLUDE_META;
  },
): GeneratedOperations<MapValueType<INCLUDE_META>> {
  const opts = {
    maxDepth: 2,
    useExternalFragmentForS3Object: true,
    typenameIntrospection: true,
    ...options,
  };

  const extendedSchema = buildSchema(schema);

  const gqlOperations: GQLAllOperations = generateAllOps(extendedSchema, opts.maxDepth, {
    useExternalFragmentForS3Object: opts.useExternalFragmentForS3Object,
    typenameIntrospection: opts.typenameIntrospection,
  });

  const allOperations = {
    queries: new Map<string, MapValueType<INCLUDE_META>>(),
    mutations: new Map<string, MapValueType<INCLUDE_META>>(),
    subscriptions: new Map<string, MapValueType<INCLUDE_META>>(),
    fragments: new Map<string, string>(),
  };

  ['queries', 'mutations', 'subscriptions'].forEach(op => {
    const ops = gqlOperations[op];
    if (ops.length) {
      const renderedOperations = renderOperations(gqlOperations[op], options.includeMetaData);
      allOperations[op] = renderedOperations;
    }
  });

  if (gqlOperations.fragments.length) {
    const renderedFragments = renderFragments(gqlOperations.fragments, opts.useExternalFragmentForS3Object);
    allOperations['fragments'] = renderedFragments;
  }

  return allOperations;
}

export type GraphQLWithMeta = {
  /**
   * The generated graphql string.
   */
  graphql: string;

  /**
   * E.g., `GetMyModel` or `ListMyModels`.
   *
   * This is used for generating type names.
   *
   * `undefined` for fragments.
   */
  operationName: string | undefined;

  /**
   * `undefined` for fragments.
   */
  operationType: 'query' | 'mutation' | 'subscription' | undefined;

  /**
   * E.g., `getMyModel` or `listMyModels`.
   *
   * It's the name of the operation that lives under Queries, Mutations, or Subscriptions
   * in the schema and is generally used as the key + variable name referring to the query.
   */
  fieldName: string;
};

export type GeneratedOperations<T> = {
  queries: Map<string, T>;
  mutations: Map<string, T>;
  subscriptions: Map<string, T>;
  fragments: Map<string, string>;
};

type MapValueType<INCLUDE_META extends boolean> = INCLUDE_META extends true ? GraphQLWithMeta : string;

function renderOperations<INCLUDE_META extends boolean>(
  operations: Array<GQLTemplateOp>,
  includeMetaData: INCLUDE_META,
): Map<string, MapValueType<INCLUDE_META>> {
  const renderedOperations = new Map<string, MapValueType<INCLUDE_META>>();
  if (operations?.length) {
    operations.forEach(op => {
      const name = op.fieldName || op.name;
      const gql = renderOperation(op);
      if (includeMetaData) {
        renderedOperations.set(name, {
          graphql: gql,
          operationName: op.name,
          operationType: op.type,
          fieldName: op.fieldName,
        } as MapValueType<INCLUDE_META>);
      } else {
        renderedOperations.set(name, gql as MapValueType<INCLUDE_META>);
      }
    });
  }

  return renderedOperations;
}

function renderOperation(operation: GQLTemplateOp): string {
  const templateStr = getOperationPartial();
  const template = Mustache.render(templateStr, operation, templatePartials);
  return template;
}

function renderFragments(fragments: Array<GQLTemplateFragment>, useExternalFragmentForS3Object: boolean): Map<string, string> {
  const renderedFragments = new Map<string, string>();
  if (fragments?.length) {
    fragments.forEach(fragment => {
      const name = fragment.name;
      const gql = renderFragment(fragment, useExternalFragmentForS3Object);
      renderedFragments.set(name, gql);
    });
  }

  return renderedFragments;
}

function renderFragment(fragment: GQLTemplateFragment, useExternalFragmentForS3Object: boolean): string {
  if (!useExternalFragmentForS3Object) {
    return;
  }

  const templateStr = getExternalFragmentPartial();
  const template = Mustache.render(templateStr, fragment, templatePartials);
  return template;
}
