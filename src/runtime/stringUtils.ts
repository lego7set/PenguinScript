const package = { __proto__: null };

import { toString } from "./conversions";

function* join(util, str: any, str2: any) {
  return yield* toString(str) + yield* toString(str);
}

package.join = join;
package.concat = join;

export default package;
