// The user and order bodies as TypeScript types with typia tags, the way a
// typia user writes them. typia compiles each call below into a dedicated
// function at build time (`npx ttsc`, output in ../typia/dist). The user
// schema closes the object (additionalProperties: false), so its validators
// use the `equals` forms, which reject extra keys; the order schema does not,
// so its validators use the plain forms.
import typia, { tags } from "typia";

export interface User {
  email: string & tags.Format<"email"> & tags.MaxLength<128>;
  name: string & tags.MinLength<1> & tags.MaxLength<80>;
  age: number & tags.Type<"int32"> & tags.Minimum<13> & tags.Maximum<130>;
  newsletter?: boolean;
}

export interface Order {
  id: string & tags.Format<"uuid">;
  customer: {
    id: number & tags.Type<"int64"> & tags.Minimum<1>;
    email: string & tags.Format<"email">;
    name: string & tags.MinLength<1> & tags.MaxLength<100>;
    phone?: string & tags.MaxLength<20>;
  };
  items: Array<{
    sku: string & tags.Pattern<"^[A-Z]{3}-\\d{4}$">;
    name: string & tags.MinLength<1> & tags.MaxLength<200>;
    quantity: number & tags.Type<"int32"> & tags.Minimum<1> & tags.Maximum<1000>;
    unitPrice: number & tags.Minimum<0>;
    currency: "USD" | "EUR" | "TRY";
  }> & tags.MinItems<1> & tags.MaxItems<50>;
  shippingAddress: {
    street: string & tags.MinLength<1>;
    city: string & tags.MinLength<1>;
    postalCode: string & tags.MinLength<3> & tags.MaxLength<10>;
    country: string & tags.MinLength<2> & tags.MaxLength<2>;
  };
  createdAt: string & tags.Format<"date-time">;
  notes?: string & tags.MaxLength<500>;
  coupon?: string;
}

export const isUser = typia.createEquals<User>();
export const validateUser = typia.createValidateEquals<User>();
export const isOrder = typia.createIs<Order>();
export const validateOrder = typia.createValidate<Order>();
