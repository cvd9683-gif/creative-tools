/** Derby components. Each function returns an HTML string; render it inside an element with class "derby". */
export type Service = "claude" | "chatgpt" | "gemini" | "imported";
export type LaneState = "idle" | "working" | "your_turn" | "unreadable";
export interface LaneProps { n: number; service: Service; task: string; state: LaneState; /** messages the person sent (Counted) */ sent: number; }
export interface HorseProps { pose?: "still" | "gallop"; service?: Service; }
export interface TrackProps { state?: LaneState; service?: Service; empty?: boolean; }
export interface StateLabelProps { state: LaneState; }
export interface ProvenanceTagProps { kind: "counted" | "estimate" | "said" | "na"; text?: string; }
export interface ButtonProps { label: string; variant?: "primary" | "secondary" | "quiet" | "icon"; size?: "sm" | "md"; icon?: string; iconAfter?: string; disabled?: boolean; danger?: boolean; }
export interface BadgeProps { /** ≤4 characters; empty hides it */ count: number | string; }
export interface CardProps { id?: string; title: string; sub?: string; body?: string; aside?: string; tight?: boolean; }
export interface EditableFieldProps { id?: string; label: string; value?: string; cite?: string; rows?: number; busy?: boolean; }
export interface ConsentSheetProps { task: string; service: Service; sent: number; replies: number; chars: string; purpose?: "handoff" | "suggestion" | "skill search"; lines: [string, string][]; center?: boolean; }
export interface ToastProps { text: string; kind?: "info" | "error"; action?: string; icon?: string; }
export interface EmptyStateProps { hosted?: boolean; }
export interface ErrorLaneProps { n: number; service: Service; task: string; sent?: number; }
export interface DemoBannerProps { text?: string; noExit?: boolean; }
export interface ToggleProps { label: string; hint?: string; on: boolean; }
export declare function Lane(p: LaneProps): string;
export declare function Horse(p: HorseProps): string;
export declare function Track(p: TrackProps): string;
export declare function StateLabel(p: StateLabelProps): string;
export declare function ProvenanceTag(p: ProvenanceTagProps): string;
export declare function Button(p: ButtonProps): string;
export declare function Badge(p: BadgeProps): string;
export declare function Card(p: CardProps): string;
export declare function EditableField(p: EditableFieldProps): string;
export declare function ConsentSheet(p: ConsentSheetProps): string;
export declare function Toast(p: ToastProps): string;
export declare function EmptyState(p?: EmptyStateProps): string;
export declare function ErrorLane(p: ErrorLaneProps): string;
export declare function DemoBanner(p?: DemoBannerProps): string;
export declare function Toggle(p: ToggleProps): string;
export interface RaceStep { t: string; done: boolean; }
export interface RaceProps extends LaneProps { /** your last prompt in that chat */ prompt?: string; /** its message number, e.g. "#4" */ cite?: string; /** steps the page has shown this reply */ steps?: RaceStep[]; /** row is rising in */ enter?: boolean; /** seconds since this reply started (working) */ elapsed?: number; /** seconds to glide ahead until the next update */ drift?: number; }
export interface LawnProps { races: RaceProps[]; /** index of the row whose card is open */ open?: number; }
export interface RaceStackProps { count: number; races: RaceProps[]; open?: number; muted?: boolean; demo?: boolean; /** Receipt() html; adds the ticket slot */ receipt?: string; /** task labels whose receipts wait in the slot */ waiting?: string[]; }
export interface PromptSwapProps { cite: string; was: string[]; try: string; saves: string; why?: string; }
export interface ReceiptProps { service: Service; task: string; date: string; prompts: number; replies: number; promptTokens: string; replyTokens: string; total: string; promptTokensN: number; replyTokensN: number; note?: string; state?: "consent" | "done"; swaps?: PromptSwapProps[]; rating?: "yes" | "partly" | "no"; }
export declare function Lawn(p: LawnProps): string;
export declare function RaceCard(p: RaceProps & { id?: string }): string;
export declare function RaceStack(p: RaceStackProps): string;
export declare function PromptSwap(p: PromptSwapProps): string;
export declare function Receipt(p: ReceiptProps): string;
