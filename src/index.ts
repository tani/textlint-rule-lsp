import { TextlintRuleModule } from "@textlint/types";
import * as VSCodeLanguageClient from "vscode-languageclient/node";

export interface Options {
    // if the Str includes `allows` word, does not report it
    allows?: string[];
}

const report: TextlintRuleModule<Options> = (context, options = {}) => {
    const serverOptions: VSCodeLanguageClient.ServerOptions = null as any;
    const clientOptions: VSCodeLanguageClient.LanguageClientOptions = {};
    const languageClient = new VSCodeLanguageClient.LanguageClient("", serverOptions, clientOptions);
    const {Syntax, RuleError, report, getSource} = context;
    const allows = options.allows || [];
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
