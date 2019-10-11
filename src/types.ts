export type Unary<In, Out> = (x: In) => Out;
export type AsyncUnary<In, Out> = (x: In) => Out | Promise<Out>;
