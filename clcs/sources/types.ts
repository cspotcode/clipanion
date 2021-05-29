export type Awaitable<T> = T | Promise<T>;
export type SingleOrArray<T> = T | Array<T>;

/**
 * A raw completion request sent by the shells.
 * It shouldn't be used by itself.
 */
export interface ShellCompletionRequest {
  input: string;
  cursorPosition: string;
}

/**
 * A completion request forwarded to the CLI developer.
 */
export interface CompletionRequest {
  input: string;
  cursorPosition: number;
}

/**
 * A detailed `CompletionResult`.
 *
 * Optional fields aren't supported by all shells, but including them where possible
 * drastically improves the experience of the users that can take advantage of them.
 */
export interface RichCompletionResult {
  /**
   * The text that will replace the word the user typed.
   *
   * Supported by all shells.
   */
  completionText: string;

  /**
   * The text that will be displayed for the item in the list of completions to choose from.
   *
   * Defaults to {@link completionText}.
   *
   * Only supported by some shells.
   */
  listItemText?: string;

  /**
   * The description of the completion.
   *
   * Only supported by some shells.
   */
  description?: string;
}

/**
 * `CompletionResult`s are returned by `CompletionFunction`s.
 *
 * They can either be strings, which represent the `completionText`,
 * or `RichCompletionResult`s, which can contain extra metadata.
 */
export type CompletionResult = string | RichCompletionResult;

/**
 * `CompletionResult`s are returned by `CompletionFunction`s.
 *
 * They can be wrapped in a promise.
 *
 * They can be a single `CompletionResult` or an array of them.
 */
export type CompletionResults = Awaitable<SingleOrArray<CompletionResult>>;

/**
 * A function that returns `CompletionResult`s for a `CompletionRequest`.
 */
export type CompletionFunction = (request: CompletionRequest) => CompletionResults;

/**
 * A normalized completion result that is sent to the shells.
 */
export type ShellCompletionResult = RichCompletionResult & Required<Pick<RichCompletionResult, 'listItemText'>>;

/**
 * The options of the `getCompletionBlock` function.
 */
export interface GetCompletionBlockOptions {
  /**
   * The command that will be executed to get the completion provider.
   * It doesn't necessarily have to call the binary the completion is registered for.
   */
  getCompletionProviderCommand: string;
}

/**
 * The options of the `getCompletionProvider` function.
 */
export interface GetCompletionProviderOptions {
  /**
   * The name of the binary that completion should be registered for.
   */
  binaryName: string;

  /**
   * The command that will be executed to request completion.
   * It doesn't necessarily have to call the binary the completion is registered for.
   */
  requestCompletionCommand: string;
}

/**
 * Implements a communication layer between shells and the rest of `clcs`.
 *
 * The only place in the codebase that can contain shell-specific code.
 *
 * All shell drivers should be documented in-depth, including
 * all relevant documentation and articles, because otherwise
 * nobody will be able to understand what's going on.
 */
export interface ShellDriver {
  /**
   * The name of the shell binary.
   * Directly referenced by the user.
   */
  shellName: string;

  /**
   * Checks if the shell is the default on the current system.
   */
  isDefaultShell: () => boolean;

  /**
   * @returns An absolute path to the configuration file of the shell.
   */
  getShellConfigurationFile: () => string;

  /**
   * Generates a one-line completion block that can be stored inside the user's shell configuration file to register the completion provider.
   *
   * The function must not depend on any external state - its return value must be consistent for a given set of options,
   * as it's also used to cleanup the user's shell configuration file.
   */
  getCompletionBlock: (options: GetCompletionBlockOptions) => string;

  /**
   * Generates a completion provider that will be registered inside the shell.
   * The code returned by this function will be hidden from the end-user.
   */
  getCompletionProvider: (options: GetCompletionProviderOptions) => string;

  /**
   * Generates a reply that will be sent to the shell when completion is requested.
   * The output can be further processed by the script generated by `getCompletionProvider`.
   */
  getReply: (completionResults: Array<ShellCompletionResult>) => string;
}