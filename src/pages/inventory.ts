import { TestPoint } from "../testpoint/TestPoint";
import { PageClass } from "../testpoint/pageTestPoints";
import { BacklinksAnalyticsPage, BacklinksHistoryPage } from "./backlinks.page";
import { BrandVoicePage } from "./brandVoice.page";
import { CalendarPage } from "./calendar.page";
import { DashboardPage } from "./dashboard.page";
import { DocumentsPage } from "./documents.page";
import { KeywordIntelligencePage, KeywordRecentPage } from "./keywordIntelligence.page";
import { LinkNetworkPage } from "./linkNetwork.page";
import { LlmRankDiscoverPage, LlmRankPage } from "./llmRank.page";
import { PlumaArtPage } from "./plumaArt.page";
import { PlumaHumanizePage } from "./plumaHumanize.page";
import { RewardsPage } from "./rewards.page";
import {
  AccountProfilePage,
  BillingPage,
  HelpCenterPage,
  IntegrationsPage,
  SettingsPage,
  TrashPage,
  WorkspaceSettingsPage,
} from "./settings.page";
import { TemplatesPage } from "./templates.page";
import { TopicalMapPage } from "./topicalMap.page";
import { WorkspaceCreationPage } from "./workspaceCreation.page";

export type InventoryPage = PageClass & { testPoints(): TestPoint[] };

/**
 * Every logged-in route with a fixed URL. Each one has an inspect suite (TP-OPEN + TP-BTN-*).
 * Not listed: /login (logged out), /app/templates/:id and /copy-butler/:id (dynamic ids;
 * Copy Butler needs a real document to be created first).
 */
export const PAGE_INVENTORY: InventoryPage[] = [
  DashboardPage,
  DocumentsPage,
  BrandVoicePage,
  TopicalMapPage,
  CalendarPage,
  LlmRankPage,
  LlmRankDiscoverPage,
  PlumaArtPage,
  PlumaHumanizePage,
  LinkNetworkPage,
  BacklinksAnalyticsPage,
  BacklinksHistoryPage,
  KeywordIntelligencePage,
  KeywordRecentPage,
  TemplatesPage,
  SettingsPage,
  AccountProfilePage,
  WorkspaceSettingsPage,
  IntegrationsPage,
  BillingPage,
  HelpCenterPage,
  TrashPage,
  WorkspaceCreationPage,
  RewardsPage,
];
