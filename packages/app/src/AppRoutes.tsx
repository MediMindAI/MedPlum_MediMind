// SPDX-FileCopyrightText: Copyright Orangebot, Inc. and Medplum contributors
// SPDX-License-Identifier: Apache-2.0
import type { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router';
import { BotsPage } from './admin/BotsPage';
import { ClientsPage } from './admin/ClientsPage';
import { CreateBotPage } from './admin/CreateBotPage';
import { CreateClientPage } from './admin/CreateClientPage';
import { DatabaseToolsPage } from './admin/DatabaseToolsPage';
import { EditMembershipPage } from './admin/EditMembershipPage';
import { InvitePage } from './admin/InvitePage';
import { PatientsPage } from './admin/PatientsPage';
import { ProjectAdminConfigPage } from './admin/ProjectAdminConfigPage';
import { ProjectDetailsPage } from './admin/ProjectDetailsPage';
import { ProjectPage } from './admin/ProjectPage';
import { SecretsPage } from './admin/SecretsPage';
import { SitesPage } from './admin/SitesPage';
import { SuperAdminAsyncDashboardPage } from './admin/SuperAdminAsyncJobPage';
import { SuperAdminPage } from './admin/SuperAdminPage';
import { UsersPage } from './admin/UsersPage';
import { BatchPage } from './BatchPage';
import { BulkAppPage } from './BulkAppPage';
import { ChangePasswordPage } from './ChangePasswordPage';
import { CreateResourcePage } from './CreateResourcePage';
import { ErrorPage } from './ErrorPage';
import { FormPage } from './FormPage';
import { HomePage } from './HomePage';
import { AssaysPage } from './lab/AssaysPage';
import { PanelsPage } from './lab/PanelsPage';
import { MfaPage } from './MfaPage';
import { OAuthPage } from './OAuthPage';
import { RegisterPage } from './RegisterPage';
import { ResetPasswordPage } from './ResetPasswordPage';
import { ApplyPage } from './resource/ApplyPage';
import { AppsPage } from './resource/AppsPage';
import { AuditEventPage } from './resource/AuditEventPage';
import { BlamePage } from './resource/BlamePage';
import { BotEditor } from './resource/BotEditor';
import { BuilderPage } from './resource/BuilderPage';
import { ChecklistPage } from './resource/ChecklistPage';
import { DeletePage } from './resource/DeletePage';
import { DetailsPage } from './resource/DetailsPage';
import { EditPage } from './resource/EditPage';
import { ExportPage } from './resource/ExportPage';
import { FormCreatePage } from './resource/FormCreatePage';
import { HistoryPage } from './resource/HistoryPage';
import { JsonCreatePage } from './resource/JsonCreatePage';
import { JsonPage } from './resource/JsonPage';
import { PreviewPage } from './resource/PreviewPage';
import { ProfilesPage } from './resource/ProfilesPage';
import { QuestionnaireBotsPage } from './resource/QuestionnaireBotsPage';
import { QuestionnaireResponsePage } from './resource/QuestionnaireResponsePage';
import { ReferenceRangesPage } from './resource/ReferenceRangesPage';
import { ReportPage } from './resource/ReportPage';
import { ResourcePage } from './resource/ResourcePage';
import { ResourceVersionPage } from './resource/ResourceVersionPage';
import { SubscriptionsPage } from './resource/SubscriptionsPage';
import { TimelinePage } from './resource/TimelinePage';
import { ToolsPage } from './resource/ToolsPage';
import { SecurityPage } from './SecurityPage';
import { SetPasswordPage } from './SetPasswordPage';
import { SignInPage } from './SignInPage';
import { SmartSearchPage } from './SmartSearchPage';
import { VerifyEmailPage } from './VerifyEmailPage';
import { EMRPage } from './emr/EMRPage';
import { PlaceholderView } from './emr/components/PlaceholderView/PlaceholderView';
import { ProtectedRoute } from './emr/components/ProtectedRoute/ProtectedRoute';
import { EMRPermission } from './emr/hooks/useEMRPermissions';
import { PatientHistorySection } from './emr/sections/PatientHistorySection';
import { RegistrationSection } from './emr/sections/RegistrationSection';
import { NomenclatureSection } from './emr/sections/NomenclatureSection';
import { PatientEditView } from './emr/views/registration/PatientEditView';
import { UnifiedRegistrationView } from './emr/views/registration/UnifiedRegistrationView';
import { PatientHistoryView } from './emr/views/patient-history/PatientHistoryView';
import { NomenclatureMedical1View } from './emr/views/nomenclature/NomenclatureMedical1View';
import { ErrorBoundary } from '@medplum/react';

export function AppRoutes(): JSX.Element {
  return (
    <Routes>
      <Route errorElement={<ErrorPage />}>
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/oauth" element={<OAuthPage />} />
        <Route path="/resetpassword" element={<ResetPasswordPage />} />
        <Route path="/setpassword/:id/:secret" element={<SetPasswordPage />} />
        <Route path="/verifyemail/:id/:secret" element={<VerifyEmailPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/changepassword" element={<ChangePasswordPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/mfa" element={<MfaPage />} />
        <Route path="/batch" element={<BatchPage />} />
        <Route path="/bulk/:resourceType" element={<BulkAppPage />} />
        <Route path="/smart" element={<SmartSearchPage />} />
        <Route path="/forms/:id" element={<FormPage />} />
        <Route path="/admin/super" element={<SuperAdminPage />} />
        <Route path="/admin/super/asyncjob" element={<SuperAdminAsyncDashboardPage />} />
        <Route path="/admin/super/db" element={<DatabaseToolsPage />} />
        <Route path="/admin/config" element={<ProjectAdminConfigPage />} />
        <Route path="/admin" element={<ProjectPage />}>
          <Route path="patients" element={<PatientsPage />} />
          <Route path="bots/new" element={<CreateBotPage />} />
          <Route path="bots" element={<BotsPage />} />
          <Route path="clients/new" element={<CreateClientPage />} />
          <Route path="clients" element={<ClientsPage />} />
          <Route path="details" element={<ProjectDetailsPage />} />
          <Route path="invite" element={<InvitePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="project" element={<ProjectDetailsPage />} />
          <Route path="secrets" element={<SecretsPage />} />
          <Route path="sites" element={<SitesPage />} />
          <Route path="members/:membershipId" element={<EditMembershipPage />} />
        </Route>
        <Route path="/lab/assays" element={<AssaysPage />} />
        <Route path="/lab/panels" element={<PanelsPage />} />
        <Route path="/emr" element={<EMRPage />}>
          {/* Default route - redirect to registration */}
          <Route index element={<Navigate to="registration" replace />} />

          {/* Registration Section */}
          <Route path="registration" element={<RegistrationSection />}>
            {/* Default route - redirect to registration page */}
            <Route index element={<Navigate to="registration" replace />} />

            {/* Main Registration Page - Unified Layout (search + registration + table) */}
            <Route
              path="registration"
              element={
                <ProtectedRoute requiredPermission={EMRPermission.VIEW_PATIENTS}>
                  <UnifiedRegistrationView />
                </ProtectedRoute>
              }
            />

            {/* Edit Existing Patient (opens in modal from main page) */}
            <Route
              path="edit/:id"
              element={
                <ProtectedRoute requiredPermission={EMRPermission.EDIT_PATIENTS}>
                  <PatientEditView />
                </ProtectedRoute>
              }
            />

            {/* Placeholder routes for other sub-menu items (not implemented yet) */}
            <Route path="contracts" element={<PlaceholderView titleKey="submenu.registration.contracts" messageKey="ui.underDevelopment" />} />
            <Route path="inpatient" element={<PlaceholderView titleKey="submenu.registration.inpatient" messageKey="ui.underDevelopment" />} />
            <Route path="debts" element={<PlaceholderView titleKey="submenu.registration.debts" messageKey="ui.underDevelopment" />} />
            <Route path="advances" element={<PlaceholderView titleKey="submenu.registration.advances" messageKey="ui.underDevelopment" />} />
            <Route path="archive" element={<PlaceholderView titleKey="submenu.registration.archive" messageKey="ui.underDevelopment" />} />
            <Route path="referrals" element={<PlaceholderView titleKey="submenu.registration.referrals" messageKey="ui.underDevelopment" />} />
            <Route path="currency" element={<PlaceholderView titleKey="submenu.registration.currency" messageKey="ui.underDevelopment" />} />
          </Route>

          {/* Patient History Section with 13 sub-routes */}
          <Route path="patient-history" element={<PatientHistorySection />}>
            {/* Default route - redirect to history page */}
            <Route index element={<Navigate to="history" replace />} />

            <Route
              path="history"
              element={
                <ProtectedRoute requiredPermission={EMRPermission.VIEW_PATIENTS}>
                  <ErrorBoundary>
                    <PatientHistoryView />
                  </ErrorBoundary>
                </ProtectedRoute>
              }
            />
            <Route
              path="my-patients"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.myPatients"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-my-patients-placeholder"
                />
              }
            />
            <Route
              path="surrogacy"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.surrogacy"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-surrogacy-placeholder"
                />
              }
            />
            <Route
              path="invoices"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.invoices"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-invoices-placeholder"
                />
              }
            />
            <Route
              path="form-100"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.form100"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-form-100-placeholder"
                />
              }
            />
            <Route
              path="prescriptions"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.prescriptions"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-prescriptions-placeholder"
                />
              }
            />
            <Route
              path="execution"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.execution"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-execution-placeholder"
                />
              }
            />
            <Route
              path="laboratory"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.laboratory"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-laboratory-placeholder"
                />
              }
            />
            <Route
              path="duty"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.duty"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-duty-placeholder"
                />
              }
            />
            <Route
              path="appointments"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.appointments"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-appointments-placeholder"
                />
              }
            />
            <Route
              path="hospital"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.hospital"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-hospital-placeholder"
                />
              }
            />
            <Route
              path="nutrition"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.nutrition"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-nutrition-placeholder"
                />
              }
            />
            <Route
              path="moh"
              element={
                <PlaceholderView
                  titleKey="submenu.patientHistory.moh"
                  messageKey="ui.underDevelopment"
                  testId="patient-history-moh-placeholder"
                />
              }
            />
          </Route>

          {/* Nomenclature Section with 13 sub-routes */}
          <Route path="nomenclature" element={<NomenclatureSection />}>
            <Route index element={<Navigate to="medical-1" replace />} />
            <Route path="medical-1" element={<NomenclatureMedical1View />} />
            <Route path="medical-2" element={<PlaceholderView titleKey="submenu.nomenclature.medical2" messageKey="ui.underDevelopment" />} />
            <Route path="goods" element={<PlaceholderView titleKey="submenu.nomenclature.goods" messageKey="ui.underDevelopment" />} />
            <Route path="laboratory" element={<PlaceholderView titleKey="submenu.nomenclature.laboratory" messageKey="ui.underDevelopment" />} />
            <Route path="prices" element={<PlaceholderView titleKey="submenu.nomenclature.prices" messageKey="ui.underDevelopment" />} />
            <Route path="price-list" element={<PlaceholderView titleKey="submenu.nomenclature.priceList" messageKey="ui.underDevelopment" />} />
            <Route path="icd10-ncsp-icpc2" element={<PlaceholderView titleKey="submenu.nomenclature.icd10" messageKey="ui.underDevelopment" />} />
            <Route path="lab-aliases" element={<PlaceholderView titleKey="submenu.nomenclature.labAliases" messageKey="ui.underDevelopment" />} />
            <Route path="groups" element={<PlaceholderView titleKey="submenu.nomenclature.groups" messageKey="ui.underDevelopment" />} />
            <Route path="physical" element={<PlaceholderView titleKey="submenu.nomenclature.physical" messageKey="ui.underDevelopment" />} />
            <Route path="forms" element={<PlaceholderView titleKey="submenu.nomenclature.forms" messageKey="ui.underDevelopment" />} />
            <Route path="settings" element={<PlaceholderView titleKey="submenu.nomenclature.settings" messageKey="ui.underDevelopment" />} />
            <Route path="tests" element={<PlaceholderView titleKey="submenu.nomenclature.tests" messageKey="ui.underDevelopment" />} />
          </Route>
          <Route
            path="administration"
            element={
              <PlaceholderView
                titleKey="placeholder.administration.title"
                messageKey="placeholder.administration.message"
                testId="administration-placeholder"
              />
            }
          />
          <Route
            path="forward"
            element={
              <PlaceholderView
                titleKey="placeholder.forward.title"
                messageKey="placeholder.forward.message"
                testId="forward-placeholder"
              />
            }
          />
          <Route
            path="reports"
            element={
              <PlaceholderView
                titleKey="placeholder.reports.title"
                messageKey="placeholder.reports.message"
                testId="reports-placeholder"
              />
            }
          />
        </Route>
        <Route path="/:resourceType/new" element={<CreateResourcePage />}>
          <Route index element={<FormCreatePage />} />
          <Route path="form" element={<FormCreatePage />} />
          <Route path="json" element={<JsonCreatePage />} />
          <Route path="profiles" element={<FormCreatePage />} />
        </Route>
        <Route path="/:resourceType/:id" element={<ResourcePage />}>
          <Route index element={<TimelinePage />} />
          <Route path="apply" element={<ApplyPage />} />
          <Route path="apps" element={<AppsPage />} />
          <Route path="event" element={<AuditEventPage />} />
          <Route path="blame" element={<BlamePage />} />
          <Route path="bots" element={<QuestionnaireBotsPage />} />
          <Route path="builder" element={<BuilderPage />} />
          <Route path="checklist" element={<ChecklistPage />} />
          <Route path="delete" element={<DeletePage />} />
          <Route path="details" element={<DetailsPage />} />
          <Route path="edit" element={<EditPage />} />
          <Route path="editor" element={<BotEditor />} />
          <Route path="history">
            <Route index element={<HistoryPage />} />
            <Route path=":versionId/:tab" element={<ResourceVersionPage />} />
            <Route path=":versionId" element={<ResourceVersionPage />} />
          </Route>
          <Route path="_history">
            <Route index element={<HistoryPage />} />
            <Route path=":versionId/:tab" element={<ResourceVersionPage />} />
            <Route path=":versionId" element={<ResourceVersionPage />} />
          </Route>
          <Route path="json" element={<JsonPage />} />
          <Route path="preview" element={<PreviewPage />} />
          <Route path="responses" element={<QuestionnaireResponsePage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="ranges" element={<ReferenceRangesPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="timeline" element={<TimelinePage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="profiles" element={<ProfilesPage />} />
          <Route path="export" element={<ExportPage />} />
        </Route>
        <Route path="/:resourceType" element={<HomePage />} />
        <Route path="/" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
