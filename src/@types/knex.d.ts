import { Knex } from "knex";

declare module "knex/types/tables" {
  export interface Tables {
    users: {
      id: string;
      name: string;
      picture_profile: string;
      created_at: string;
    };
    meals: {
      id: string;
      user_id: string;
      name: string;
      description: string;
      created_at: string;
      date: Date;
      hour: number;
      inside_diet: boolean;
    };
  }
}
