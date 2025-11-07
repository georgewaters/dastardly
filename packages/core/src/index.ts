// dASTardly core --------------------------------------------------------------

export type Scalar = string | number | boolean | null;

export enum NodeType {
  Object,
  Array,
  String,
  Number,
  Boolean,
  Null,
}

export interface Position {
  readonly line: number;
  readonly column: number;
}

export interface Span {
  readonly start: Position;
  readonly end: Position;
}

type ScalarNodeType = NodeType.String | NodeType.Number | NodeType.Boolean | NodeType.Null;


type DastardlyChildren<T extends NodeType> = T extends NodeType.Array ?
  Set<DastardlyNode<NodeType>> :
  T extends NodeType.Object ?
  Map<string, DastardlyNode<NodeType>> : never;

type DastardlyValue<T extends NodeType> = T extends NodeType.Null ? null : T extends NodeType.Number ? number : T extends NodeType.String ? string : T extends NodeType.Boolean ? boolean : never;

// Base class with common metadata & helpers
export class DastardlyNode<T extends NodeType> implements Span {
  constructor(
    public readonly type: T,
    public readonly start: Position,
    public readonly end: Position,
    public children: DastardlyChildren<T>,
    public value: DastardlyValue<T>,
    public parent?: DastardlyNode<NodeType>,
  ) { }

  public isScalar(): this is DastardlyNode<ScalarNodeType> {
    return [NodeType.String, NodeType.Number, NodeType.Boolean, NodeType.Null].includes(this.type);
  }

  public *walk() {
    if (this.isScalar()) {
      yield this;
    }
  }

  public clone() {
    return new DastardlyNode(this.type, this.start, this.end, this.children, this.value, this.parent);
  }
}

// Concrete nodes --------------------------------------------------------------

export class DastardlyObjectNode extends DastardlyNode {
  readonly type = NodeType.Object;
  children: Map<string, DNode>;

  constructor(
    children: Map<string, DNode> = new Map(),
    span: Span,
    parent?: DNode | DastardlyRoot
  ) {
    super(span.start, span.end, parent);
    this.children = children;
    for (const child of children.values()) child.parent = this;
  }

  clone(shallow = false): this {
    const kids = shallow
      ? new Map(this.children)
      : new Map([...this.children.entries()].map(([k, v]) => [k, v.clone() as DNode]));
    const copy = new DastardlyObjectNode(kids, this, this.parent);
    return copy;
  }

  toNative(): unknown {
    const obj: Record<string, unknown> = {};
    for (const [k, v] of this.children) obj[k] = v.toNative();
    return obj;
  }

}

export class DastardlyArrayNode extends DastardlyNode {
  readonly type = NodeType.Array;
  children: Set<DNode>;

  constructor(
    children: Set<DNode> = new Set(),
    span: Span,
    parent?: DNode | DastardlyRoot
  ) {
    super(span.start, span.end, parent);
    for (const c of children) c.parent = this;
    this.children = children;
  }

  clone(shallow = false): this {
    const kids = shallow
      ? new Set(this.children)
      : new Set([...this.children].map((c) => c.clone() as DNode));
    const copy = new DastardlyArrayNode(kids, this, this.parent);
    return copy;
  }

  toNative(): unknown {
    return [...this.children].map((n) => n.toNative());
  }

}

export class DastardlyStringNode extends DastardlyNode {
  readonly type = NodeType.String;
  constructor(
    public value: string,
    span: Span,
    parent?: DNode | DastardlyRoot
  ) {
    super(span.start, span.end, parent);
  }
  clone(): this {
    return new DastardlyStringNode(this.value, this, this.parent);
  }
  toNative(): unknown {
    return this.value;
  }
}

export class DastardlyNumberNode extends DastardlyNode {
  readonly type = NodeType.Number;
  constructor(
    public value: number,
    span: Span,
    parent?: DNode | DastardlyRoot
  ) {
    super(span.start, span.end, parent);
  }
  clone(): this {
    return new DastardlyNumberNode(this.value, this, this.parent);
  }
  toNative(): unknown {
    return this.value;
  }
}

export class DastardlyBooleanNode extends DastardlyNode {
  readonly type = NodeType.Boolean;
  constructor(
    public value: boolean,
    span: Span,
    parent?: DNode | DastardlyRoot
  ) {
    super(span.start, span.end, parent);
  }
  clone() {
    return new DastardlyBooleanNode(this.value, this, this.parent);
  }
  toNative(): unknown {
    return this.value;
  }
}

export class DastardlyNullNode extends DastardlyNode {
  readonly type = NodeType.Null;
  readonly value: null = null;
  constructor(span: Span, parent?: DNode | DastardlyRoot) {
    super(span.start, span.end, parent);
  }
  clone(): this {
    return new DastardlyNullNode(this, this.parent);
  }
  toNative(): unknown {
    return null;
  }
}
