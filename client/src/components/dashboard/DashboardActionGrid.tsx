import { useTranslation } from "@/lib/i18n";
import { ActionCard } from "@/components/dashboard/ActionCard";
import {
  Users,
  Mail,
  Receipt,
  FileText,
  FileSignature,
  BarChart3,
  Zap,
  FolderOpen,
  Presentation,
} from "lucide-react";

export function DashboardActionGrid() {
  const { t } = useTranslation();

  return (
    <div className="space-y-8 sm:space-y-10">
      {/* CREATE */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create</h2>
          <p className="text-xs sm:text-sm text-gray-600">Start a new document fast.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ActionCard
            href="/create-invoice"
            title={t("createInvoice")}
            description={t("createInvoiceDesc")}
            borderClassName="border-l-green-500"
            iconWrapClassName="bg-green-100"
            icon={<Receipt className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />}
            testId="card-create-invoice"
          />

          <ActionCard
            href="/create-proposal"
            title={t("createProposal")}
            description={t("createProposalDesc")}
            borderClassName="border-l-blue-500"
            iconWrapClassName="bg-blue-100"
            icon={<FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
            testId="card-create-proposal"
          />

          <ActionCard
            href="/create-contract"
            title={t("createContract")}
            description={t("createContractDesc")}
            borderClassName="border-l-purple-500"
            iconWrapClassName="bg-purple-100"
            icon={<FileSignature className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
            testId="card-create-contract"
          />

          <ActionCard
            href="/create-presentation"
            title={t("createPresentation")}
            description={t("createPresentationDesc")}
            borderClassName="border-l-amber-500"
            iconWrapClassName="bg-amber-100"
            icon={<Presentation className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
            testId="card-create-presentation"
          />
        </div>
      </section>

      {/* MANAGE */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Manage</h2>
          <p className="text-xs sm:text-sm text-gray-600">Keep work organized and moving.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ActionCard
            href="/clients"
            title={t("clientManagement")}
            description={t("clientManagementDesc")}
            borderClassName="border-l-indigo-500"
            iconWrapClassName="bg-indigo-100"
            icon={<Users className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />}
            testId="card-clients"
          />

          <ActionCard
            href="/messages"
            title={t("messages")}
            description={t("messagesDesc")}
            borderClassName="border-l-blue-500"
            iconWrapClassName="bg-blue-100"
            icon={<Mail className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />}
            testId="card-messages"
          />
        </div>
      </section>

      {/* TOOLS */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tools</h2>
          <p className="text-xs sm:text-sm text-gray-600">Run the business side cleanly.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <ActionCard
            href="/productivity"
            title={t("productivityTools")}
            description={t("productivityToolsDesc")}
            borderClassName="border-l-amber-500"
            iconWrapClassName="bg-amber-100"
            icon={<BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />}
            testId="card-productivity"
          />

          <ActionCard
            href="/agency-hub"
            title={t("agencyHub")}
            description={t("agencyHubDesc")}
            borderClassName="border-l-purple-500"
            iconWrapClassName="bg-purple-100"
            icon={<Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />}
            testId="card-agency-hub"
          />

          <ActionCard
            href="/filing-cabinet"
            title={t("filingCabinet")}
            description={t("filingCabinetDesc")}
            borderClassName="border-l-gray-400"
            iconWrapClassName="bg-gray-100"
            icon={<FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />}
            testId="card-filing-cabinet"
          />
        </div>
      </section>
    </div>
  );
}
