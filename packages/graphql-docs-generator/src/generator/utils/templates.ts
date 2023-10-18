export const getTemplatePartials = () => {
  return {
    renderArgDeclaration: argDeclarationPartial,
    renderCallArgs: callArgsPartial,
    renderExternalFragment: externalFragmentPartial,
    renderFields: fieldsPartial,
    renderFragment: fragmentsPartial,
    renderOp: operationPartial,
  };
};

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
fragment {{name}} on {{ on}} {
  {{> renderFields fields=this.fields }}
}
`;

const fieldsPartial = `
{{#fields}}
  {{#hasBody}}
      {{name}} {
        {{#fields}}
        {{> renderFields}}
        {{/fields}}
        {{#fragments}}
        {{> renderFragment fragments=field.fragments}}
        {{/fragments}}
      }
  {{/hasBody}}
  {{^hasBody}}
    {{name}}
  {{/hasBody}}
{{/fields}}
`;

const fragmentsPartial = `
{{#each fragments }}
  {{#if this.fields.length}}
    {{#if this.external }}
      ...{{this.name}}
    {{else}}
    ...on {{this.on}} {
      {{> renderFields fields=this.fields }}
    }
    {{/if}}
  {{/if}}
{{/each}}
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
