/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: window.location.origin || "http://localhost:3000"
});
