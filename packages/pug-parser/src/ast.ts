// CST types — the parser's contract (plan Design §3). All offsets are absolute
// UTF-16 offsets into the `text` given to the parser.

export type Range = [start: number, end: number]

export interface PugDocument {
  type: 'Document'; text: string; range: Range
  children: PugNode[]; errors: PugParseError[]; lines: PugLine[]
  eol: '\n' | '\r\n'            // first EOL found in range; '\n' if none
  indentUnit: string            // whitespace of the first indented node line relative to its parent; '  ' if none
}
export interface PugParseError { code: string; message: string; offset: number }
export interface PugLine {
  range: Range                  // without EOL
  indent: Range                 // leading whitespace
  kind: 'node' | 'attribute' | 'paren-close' | 'raw' | 'continuation' | 'blank'
  depth: number                 // logical depth: node = nesting depth; attribute = tag depth + 1; paren-close = tag depth; raw = owner depth + 1
  anchor: number | null         // index into lines: this line must keep its column offset relative to that line (raw-block lines after the first, continuation lines)
}
export type PugNode = Tag | MixinCall | Text | Comment | Code | Control | Filter
export interface Tag {
  type: 'Tag'; range: Range     // head only: name through end of head line (incl. inline text); children are not included
  name: { value: string; range: Range } | null          // null = implicit div
  shorthands: { kind: 'class' | 'id'; value: string; range: Range }[]   // range includes '.' / '#'
  attributeBlocks: AttributeBlock[]                      // Pug allows a(x)(y); usually 0 or 1
  andAttributes: { range: Range; expression: Range }[]
  selfClose: Range | null       // the '/'
  dot: Range | null             // the '.' of a text-block tag
  expansion: Range | null       // the ':' of "a: b"
  children: PugNode[]           // inline text, buffered code, expansion child, nested lines — all here
}
export interface AttributeBlock { range: Range; attributes: Attribute[]; commas: Range[] }   // range includes '(' and ')'
export interface Attribute {
  range: Range; key: { raw: string; range: Range }
  operator: { value: '=' | '!='; range: Range } | null
  value: AttributeValue | null
}
export interface AttributeValue {
  range: Range; raw: string
  kind: 'string' | 'template' | 'expression'
  quote: '"' | "'" | '`' | null
  inner: Range | null           // between the quotes/backticks; null for 'expression'
  hasSubstitution: boolean      // template literal containing ${ ; false otherwise
}
// kind 'string' only when the WHOLE value is one '…' or "…" literal; 'template' when the whole value is one `…` literal; anything else 'expression'
export interface MixinCall { type: 'MixinCall'; range: Range; name: { value: string; range: Range }; args: Range | null
  shorthands: Tag['shorthands']; attributeBlocks: AttributeBlock[]; andAttributes: Tag['andAttributes']; children: PugNode[] }
export interface Text { type: 'Text'; form: 'inline' | 'pipe' | 'block' | 'html'; range: Range; content: Range; parts: TextPart[] }
export type TextPart =
  | { type: 'Raw'; range: Range }
  | { type: 'Interpolation'; escaped: boolean; range: Range; expression: Range }   // #{…} / !{…} (Pug compile-time)
  | { type: 'TagInterpolation'; range: Range; tag: Tag }                            // #[tag(attrs) text]
export interface Comment { type: 'Comment'; buffered: boolean; range: Range; content: Range }  // range covers the whole comment block; content starts after '//' or '//-'
export interface Code { type: 'Code'; buffered: boolean; escaped: boolean; range: Range; expression: Range; children: PugNode[] }  // '- x', '= x', '!= x', and 'p= x' as child of Tag
export interface Control { type: 'Control'; keyword: ControlKeyword; range: Range; head: Range; children: PugNode[] }
export type ControlKeyword = 'if' | 'else if' | 'else' | 'unless' | 'each' | 'for' | 'while' | 'case' | 'when' | 'default'
  | 'mixin' | 'block' | 'append' | 'prepend' | 'include' | 'extends' | 'doctype' | 'yield'
export interface Filter { type: 'Filter'; name: string; range: Range; attributeBlocks: AttributeBlock[]; children: Text[] }
