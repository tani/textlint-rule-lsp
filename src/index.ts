import { TextlintRuleModule } from "@textlint/types";
import * as jayson from "jayson";

export interface Options {
    // if the Str includes `allows` word, does not report it
    allows?: string[];
}

const report: TextlintRuleModule<Options> = (context, options = {}) => {
    const {Syntax, RuleError, report, getSource, getFilePath} = context;
    const allows = options.allows || [];
    const filePath = getFilePath()
    if (filePath === undefined) {
        throw new RuleError(`The file ${filePath} is not found.`)
    }
    const fileURI = `file://${filePath}`
    const client = new jayson.HttpClient()
    client.request("initialize", [])
    client.request("textDocument/didOpen", [])
    client.request("textDocument/didClose", [])
    return {
        [Syntax.Str](node) { // "Str" node
            const text = getSource(node); // Get text
            const matches = /bugs/g.exec(text); // Found "bugs"
            if (!matches) {
                return;
            }
            const isIgnored = allows.some(allow => text.includes(allow));
            if (isIgnored) {
                return;
            }
            const indexOfBugs = matches.index;
            const ruleError = new RuleError("Found bugs.", {
                index: indexOfBugs // padding of index
            });
            report(node, ruleError);
        }
    }
};
export default report;
