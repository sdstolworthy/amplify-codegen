export const getOperationPartial = (): string => {
  return operationPartial;
};

export const getExternalFragmentPartial = (): string => {
  return externalFragmentPartial;
};

const argDeclarationPartial = `
{{#args.length}}
  (
    {{#args}}
      \${{ name }}:{{#isList}}[{{/isList}}{{type}}{{#isRequired}}!{{/isRequired}}{{#isList}}]{{#isListRequired}}!{{/isListRequired}}{{/isList}}{{#defaultValue}}={{defaultValue}}{{/defaultValue}},
    {{/args}}
  )
{{/args.length}}
`;

const callArgsPartial = `
{{#args.length}}
  (
    {{#args}}
      {{name}}:{{value}}{{#isRequired}}!{{/isRequired}}{{#defaultValue}}={{defaultValue}}{{/defaultValue}},
    {{/args}}
  )
{{/args.length}}
`;

const externalFragmentPartial = `
fragment {{name}} on {{on}} {
  {{> renderFields }}
}
`;

const fieldsPartial = `
{{#fields}}
{{#hasBody}}
{{name}} {
  {{> renderFields}}
  {{> renderFragment}}
}
{{/hasBody}}
{{^hasBody}}
  {{name}}
{{/hasBody}}
{{/fields}}
`;

const fragmentsPartial = `
{{#fragments}}
{{#fields.length}}
{{#external}}
  ...{{name}}
{{/external}}
{{^external}}
...on {{on}} {
  {{#fields}}
  {{> renderFields}}
  {{/fields}}
}
{{/external}}
{{/fields.length}}
{{/fragments}}
`;

const operationPartial = `
{{type}} {{name}} {{>renderArgDeclaration}}{
  {{#body}}
  {{name}}{{> renderCallArgs}} 
  {{#hasBody}} {
    {{> renderFields}}
    {{> renderFragment}}
  }
  {{/hasBody}}
  {{/body}}
}
`;

export const templatePartials = {
  renderArgDeclaration: argDeclarationPartial,
  renderCallArgs: callArgsPartial,
  renderExternalFragment: externalFragmentPartial,
  renderFields: fieldsPartial,
  renderFragment: fragmentsPartial,
  renderOp: operationPartial,
};
