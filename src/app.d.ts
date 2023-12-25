import { Config } from "@prisma/client";

declare global {
	namespace App {
		interface Locals {
			config:Config
		}
	//   interface PageData {}
	  // interface Error {}
	  // interface Platform {}
	}
  }