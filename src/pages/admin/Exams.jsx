import { useEffect, useState } from "react";
import {
  FileCheck,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Send,
  Lock,
  Calendar,
  XCircle,
  Settings2,
  ListOrdered,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllExams,
  getExamsByStatus,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
  publishExam,
  unpublishExam,
  lockExam,
  scheduleExam,
  setExamStatus,
} from "@/services/adminExamService";
import {
  getSectionsByExamId,
  assignTemplateToExam,
  updateSection,
  deleteSection,
} from "@/services/adminExamSectionService";
import { getSectionsBySubId } from "@/services/adminCategorySectionService";
import { getTemplatesByCategorySubId } from "@/services/adminQuestionsTemplateService";
import {
  getQuotasBySectionId,
  createQuota,
  deleteQuota,
} from "@/services/adminExamSectionLessonQuotaService";
import {
  getAssignmentsByExamId,
  createAssignment,
  deleteAssignment,
} from "@/services/adminExamsQuestionService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { getAllPublishers } from "@/services/adminPublisherService";
import { getAllLessons } from "@/services/adminLessonService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDate } from "@/utils/format";

const EXAM_STATUS = [
  { value: 0, label: "Taslak", color: "neutral" },
  { value: 1, label: "Planlandı", color: "warning" },
  { value: 2, label: "Yayında", color: "success" },
  { value: 3, label: "Devam Ediyor", color: "warning" },
  { value: 4, label: "Kapalı", color: "neutral" },
  { value: 5, label: "Bitti", color: "neutral" },
  { value: 6, label: "Arşiv", color: "neutral" },
];

const NEGATIVE_MARKING = [
  { value: "4W1R", label: "4 yanlış 1 doğru" },
  { value: "3W1R", label: "3 yanlış 1 doğru" },
  { value: "Yok", label: "Yok" },
];

const toISO = (d) => {
  if (!d) return "";
  const date = new Date(d);
  return date.toISOString().slice(0, 16);
};

const defaultSection = () => ({
  name: "",
  orderIndex: 0,
  durationMinutes: 30,
  questionCountTarget: 10,
  quotas: [
    {
      lessonId: "",
      lessonSubId: "",
      minQuestions: 1,
      maxQuestions: 10,
      targetQuestions: 5,
      difficultyMix: null,
      orderIndex: 0,
    },
  ],
});

const defaultBlueprint = () => ({
  totalQuestionCount: 20,
  negativeMarkingRule: "4W1R",
});

const Exams = () => {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [publishers, setPublishers] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [statusFilter, setStatusFilter] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    instructions: "",
    durationMinutes: 120,
    graceSeconds: 15,
    publisherId: "",
    categoryId: "",
    categorySubId: "",
    startsAt: "",
    endsAt: "",
    accessDurationDays: 7,
    participationQuota: 100,
    isAdaptive: false,
    blueprint: defaultBlueprint(),
    sections: [defaultSection()],
  });
  const [scheduleForm, setScheduleForm] = useState({
    startsAt: "",
    endsAt: "",
    status: 1,
  });
  const [statusModalExam, setStatusModalExam] = useState(null);
  const [statusForm, setStatusForm] = useState({ status: 0 });
  const [manageExam, setManageExam] = useState(null);
  const [manageTab, setManageTab] = useState("sections");
  const [manageSections, setManageSections] = useState([]);
  const [manageAssignments, setManageAssignments] = useState([]);
  const [manageLoading, setManageLoading] = useState(false);
  const [categorySectionsForAssign, setCategorySectionsForAssign] = useState([]);
  const [questionTemplatesForAssign, setQuestionTemplatesForAssign] = useState([]);
  const [assignForm, setAssignForm] = useState({ categoriesSectionId: "", questionsTemplateId: "", orderIndex: 0 });
  const [sectionForm, setSectionForm] = useState({ name: "", orderIndex: 0, durationMinutes: 30, questionCountTarget: 10, quotas: [] });
  const [assignmentForm, setAssignmentForm] = useState({ questionId: "", sectionId: "", orderIndex: 0 });
  const [sectionEditForm, setSectionEditForm] = useState(null);

  const loadExams = async () => {
    setLoading(true);
    try {
      const data =
        statusFilter != null
          ? await getExamsByStatus(statusFilter)
          : await getAllExams();
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  const loadRefs = async () => {
    try {
      const [catData, pubData, lessData] = await Promise.all([
        getAllCategories(),
        getAllPublishers(),
        getAllLessons(),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setPublishers(Array.isArray(pubData) ? pubData : []);
      setLessons(Array.isArray(lessData) ? lessData : []);
    } catch {
      setCategories([]);
      setPublishers([]);
      setLessons([]);
    }
  };

  useEffect(() => {
    loadRefs();
  }, []);

  useEffect(() => {
    loadExams();
  }, [statusFilter]);

  // Ana kategori seçilince alt kategorileri yükle (sınav formu açıkken)
  useEffect(() => {
    if (!form.categoryId) {
      setSubCategories([]);
      return;
    }
    let cancelled = false;
    getSubsByCategoryId(Number(form.categoryId))
      .then((data) => {
        if (!cancelled) setSubCategories(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setSubCategories([]);
      });
    return () => {
      cancelled = true;
    };
  }, [form.categoryId]);

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      instructions: "",
      durationMinutes: 120,
      graceSeconds: 15,
      publisherId: "",
      categoryId: "",
      categorySubId: "",
      startsAt: "",
      endsAt: "",
      accessDurationDays: 7,
      participationQuota: 100,
      isAdaptive: false,
      blueprint: defaultBlueprint(),
      sections: [defaultSection()],
    });
    setSelected(null);
  };

  const openCreate = () => {
    resetForm();
    setModal("create");
  };

  const openEdit = async (item) => {
    try {
      const detail = await getExamById(item.id);
      setSelected(detail);
      const secs = detail.sections?.length
        ? detail.sections.map((s) => ({
            name: s.name || "",
            orderIndex: s.orderIndex ?? 0,
            durationMinutes: s.durationMinutes ?? 30,
            questionCountTarget: s.questionCountTarget ?? 10,
            quotas: (s.quotas || []).map((q) => ({
              lessonId: q.lessonId || "",
              lessonSubId: q.lessonSubId || "",
              minQuestions: q.minQuestions ?? 1,
              maxQuestions: q.maxQuestions ?? 10,
              targetQuestions: q.targetQuestions ?? 5,
              difficultyMix: q.difficultyMix ?? null,
              orderIndex: q.orderIndex ?? 0,
            })),
          }))
        : [defaultSection()];
      if (secs.length === 0) secs.push(defaultSection());

      setForm({
        title: detail.title || "",
        description: detail.description || "",
        instructions: detail.instructions || "",
        durationMinutes: detail.durationMinutes ?? 120,
        graceSeconds: detail.graceSeconds ?? 15,
        publisherId: detail.publisherId || "",
        categoryId: detail.categoryId ?? "",
        categorySubId: detail.categorySubId ?? "",
        startsAt: toISO(detail.startsAt),
        endsAt: toISO(detail.endsAt),
        accessDurationDays: detail.accessDurationDays ?? 7,
        participationQuota: detail.participationQuota ?? 100,
        isAdaptive: detail.isAdaptive ?? false,
        blueprint: detail.blueprint
          ? {
              totalQuestionCount: detail.blueprint.totalQuestionCount ?? 20,
              negativeMarkingRule:
                detail.blueprint.negativeMarkingRule || "4W1R",
            }
          : defaultBlueprint(),
        sections: secs,
      });
      setModal("edit");
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
    }
  };

  const openView = async (item) => {
    try {
      const detail = await getExamById(item.id);
      setSelected(detail);
      setModal("view");
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
    }
  };

  const openDelete = (item) => {
    setSelected(item);
    setModal("delete");
  };

  const openSchedule = (item) => {
    setSelected(item);
    setScheduleForm({
      startsAt: toISO(item.startsAt),
      endsAt: toISO(item.endsAt),
      status: item.status ?? 1,
    });
    setModal("schedule");
  };

  const closeModal = () => {
    setModal(null);
    setSelected(null);
    resetForm();
  };

  const addSection = () => {
    setForm((f) => ({
      ...f,
      sections: [
        ...f.sections,
        { ...defaultSection(), orderIndex: f.sections.length },
      ],
    }));
  };

  const removeSection = (idx) => {
    if (form.sections.length <= 1) return;
    setForm((f) => ({
      ...f,
      sections: f.sections.filter((_, i) => i !== idx),
    }));
  };

  const addQuota = (sectionIdx) => {
    setForm((f) => {
      const secs = [...f.sections];
      const q = secs[sectionIdx]?.quotas || [];
      secs[sectionIdx] = {
        ...secs[sectionIdx],
        quotas: [
          ...q,
          {
            lessonId: "",
            lessonSubId: "",
            minQuestions: 1,
            maxQuestions: 10,
            targetQuestions: 5,
            difficultyMix: null,
            orderIndex: q.length,
          },
        ],
      };
      return { ...f, sections: secs };
    });
  };

  const removeQuota = (sectionIdx, quotaIdx) => {
    setForm((f) => {
      const secs = [...f.sections];
      const q = [...(secs[sectionIdx]?.quotas || [])];
      if (q.length <= 1) return f;
      q.splice(quotaIdx, 1);
      secs[sectionIdx] = { ...secs[sectionIdx], quotas: q };
      return { ...f, sections: secs };
    });
  };

  const updateSection = (sectionIdx, field, value) => {
    setForm((f) => {
      const secs = [...f.sections];
      secs[sectionIdx] = { ...secs[sectionIdx], [field]: value };
      return { ...f, sections: secs };
    });
  };

  const updateQuota = (sectionIdx, quotaIdx, field, value) => {
    setForm((f) => {
      const secs = [...f.sections];
      const q = [...(secs[sectionIdx]?.quotas || [])];
      q[quotaIdx] = { ...q[quotaIdx], [field]: value };
      secs[sectionIdx] = { ...secs[sectionIdx], quotas: q };
      return { ...f, sections: secs };
    });
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    description: form.description?.trim() || undefined,
    instructions: form.instructions?.trim() || undefined,
    durationMinutes: Number(form.durationMinutes) || 120,
    graceSeconds: Number(form.graceSeconds) ?? 15,
    publisherId: form.publisherId?.trim() || undefined,
    categoryId: form.categoryId ? Number(form.categoryId) : undefined,
    categorySubId: form.categorySubId
      ? Number(form.categorySubId)
      : undefined,
    startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : undefined,
    endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : undefined,
    accessDurationDays: Number(form.accessDurationDays) ?? 7,
    participationQuota: Number(form.participationQuota) ?? 100,
    isAdaptive: form.isAdaptive,
    blueprint: {
      totalQuestionCount:
        Number(form.blueprint?.totalQuestionCount) || 20,
      negativeMarkingRule: form.blueprint?.negativeMarkingRule || "4W1R",
    },
    sections: form.sections
      .filter((s) => s.name?.trim())
      .map((s, i) => ({
        name: s.name.trim(),
        orderIndex: i,
        durationMinutes: Number(s.durationMinutes) || 30,
        questionCountTarget: Number(s.questionCountTarget) || 10,
        quotas: (s.quotas || [])
          .filter((q) => q.lessonId?.trim())
          .map((q, j) => ({
            lessonId: q.lessonId.trim(),
            lessonSubId: q.lessonSubId?.trim() || undefined,
            minQuestions: Number(q.minQuestions) ?? 1,
            maxQuestions: Number(q.maxQuestions) ?? 10,
            targetQuestions: Number(q.targetQuestions) ?? 5,
            difficultyMix: q.difficultyMix || undefined,
            orderIndex: j,
          })),
      })),
  });

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast.error("Başlık zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createExam(buildPayload());
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      closeModal();
      loadExams();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.CREATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateExam(selected.id, {
        ...buildPayload(),
        status: selected.status,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      closeModal();
      loadExams();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.UPDATE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteExam(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      closeModal();
      loadExams();
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.DELETE_FAILED);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async (item) => {
    setSubmitting(true);
    try {
      await publishExam(item.id);
      toast.success("Sınav yayınlandı.");
      loadExams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnpublish = async (item) => {
    setSubmitting(true);
    try {
      await unpublishExam(item.id);
      toast.success("Sınav yayından kaldırıldı.");
      loadExams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLock = async (item) => {
    setSubmitting(true);
    try {
      await lockExam(item.id);
      toast.success("Sınav kilitlendi.");
      loadExams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await scheduleExam(selected.id, {
        startsAt: scheduleForm.startsAt
          ? new Date(scheduleForm.startsAt).toISOString()
          : undefined,
        endsAt: scheduleForm.endsAt
          ? new Date(scheduleForm.endsAt).toISOString()
          : undefined,
        status: Number(scheduleForm.status),
      });
      toast.success("Sınav tarihleri güncellendi.");
      closeModal();
      loadExams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openStatusModal = (item) => {
    setStatusModalExam(item);
    setStatusForm({ status: item.status ?? 0 });
  };
  const closeStatusModal = () => {
    setStatusModalExam(null);
  };
  const handleSetStatus = async (e) => {
    e.preventDefault();
    if (!statusModalExam) return;
    setSubmitting(true);
    try {
      await setExamStatus(statusModalExam.id, Number(statusForm.status));
      toast.success("Sınav durumu güncellendi.");
      closeStatusModal();
      loadExams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const openManageModal = async (item) => {
    setManageExam(item);
    setManageTab("sections");
    setAssignForm({ categoriesSectionId: "", questionsTemplateId: "", orderIndex: 0 });
    setSectionEditForm(null);
    setCategorySectionsForAssign([]);
    setQuestionTemplatesForAssign([]);
    setAssignmentForm({ questionId: "", sectionId: "", orderIndex: 0 });
    setManageLoading(true);
    try {
      let exam = item;
      if (!item.categorySubId && item.id) {
        try {
          exam = await getExamById(item.id);
          setManageExam(exam);
        } catch {
          // keep item
        }
      }
      const categorySubId = exam?.categorySubId;
      const [sections, assignments, catSections, qTemplates] = await Promise.all([
        getSectionsByExamId(item.id),
        getAssignmentsByExamId(item.id),
        categorySubId ? getSectionsBySubId(categorySubId) : Promise.resolve([]),
        categorySubId ? getTemplatesByCategorySubId(categorySubId) : Promise.resolve([]),
      ]);
      const secs = Array.isArray(sections) ? sections : [];
      setManageSections(secs);
      setManageAssignments(Array.isArray(assignments) ? assignments : []);
      setCategorySectionsForAssign(Array.isArray(catSections) ? catSections : []);
      setQuestionTemplatesForAssign(Array.isArray(qTemplates) ? qTemplates : []);
      setAssignmentForm((f) => ({ ...f, sectionId: secs[0]?.id ?? "", orderIndex: 0 }));
    } catch (err) {
      toast.error(err.message || ERROR_MESSAGES.FETCH_FAILED);
      setManageSections([]);
      setManageAssignments([]);
    } finally {
      setManageLoading(false);
    }
  };
  const closeManageModal = () => {
    setManageExam(null);
    setManageSections([]);
    setManageAssignments([]);
  };
  const loadManageSections = async () => {
    if (!manageExam) return;
    try {
      const data = await getSectionsByExamId(manageExam.id);
      setManageSections(Array.isArray(data) ? data : []);
    } catch {
      setManageSections([]);
    }
  };
  const loadManageAssignments = async () => {
    if (!manageExam) return;
    try {
      const data = await getAssignmentsByExamId(manageExam.id);
      setManageAssignments(Array.isArray(data) ? data : []);
    } catch {
      setManageAssignments([]);
    }
  };
  const handleAssignTemplate = async (e) => {
    e.preventDefault();
    if (!manageExam || manageExam.isLocked) return;
    if (!assignForm.categoriesSectionId || !assignForm.questionsTemplateId) {
      toast.error("Bölüm şablonu ve soru şablonu seçin.");
      return;
    }
    setSubmitting(true);
    try {
      await assignTemplateToExam(manageExam.id, {
        categoriesSectionId: assignForm.categoriesSectionId,
        questionsTemplateId: assignForm.questionsTemplateId,
        orderIndex: Number(assignForm.orderIndex) ?? 0,
      });
      toast.success("Şablon atandı.");
      setAssignForm((f) => ({ ...f, categoriesSectionId: "", questionsTemplateId: "", orderIndex: manageSections.length }));
      loadManageSections();
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSectionOrder = async (sectionId, orderIndex, difficultyMix) => {
    if (!manageExam || manageExam.isLocked) return;
    setSubmitting(true);
    try {
      await updateSection(sectionId, { orderIndex, difficultyMix: difficultyMix || undefined });
      toast.success("Bölüm güncellendi.");
      setSectionEditForm(null);
      loadManageSections();
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteSection = async (sectionId) => {
    if (!manageExam || manageExam.isLocked) return;
    setSubmitting(true);
    try {
      await deleteSection(sectionId);
      toast.success("Bölüm silindi.");
      loadManageSections();
      loadManageAssignments();
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleAddAssignment = async (e) => {
    e.preventDefault();
    if (!manageExam || manageExam.isLocked) return;
    if (!assignmentForm.questionId?.trim() || !assignmentForm.sectionId) {
      toast.error("Soru ID ve bölüm seçin.");
      return;
    }
    setSubmitting(true);
    try {
      await createAssignment({
        examId: manageExam.id,
        questionId: assignmentForm.questionId.trim(),
        sectionId: assignmentForm.sectionId,
        orderIndex: Number(assignmentForm.orderIndex) ?? 0,
      });
      toast.success("Soru atandı.");
      setAssignmentForm((f) => ({ ...f, questionId: "", orderIndex: manageAssignments.length }));
      loadManageAssignments();
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDeleteAssignment = async (assignmentId) => {
    if (!manageExam || manageExam.isLocked) return;
    setSubmitting(true);
    try {
      await deleteAssignment(assignmentId);
      toast.success("Soru ataması kaldırıldı.");
      loadManageAssignments();
      loadExams();
    } catch (err) {
      toast.error(err.response?.data?.Error || err.response?.data?.error || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const statusLabel = (val) =>
    EXAM_STATUS.find((s) => s.value === val)?.label ?? val;
  const statusColor = (val) =>
    EXAM_STATUS.find((s) => s.value === val)?.color ?? "neutral";

  return (
    <div className="admin-page-wrapper">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <FileCheck size={28} className="text-emerald-600" />
          Sınavlar
        </h1>
        <button type="button" onClick={openCreate} className="admin-btn admin-btn-primary">
          <Plus size={18} />
          Yeni Sınav
        </button>
      </div>

      <div className="admin-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          <label className="admin-label mb-0">Durum</label>
          <select
            className="admin-input w-auto min-w-[140px]"
            value={statusFilter ?? ""}
            onChange={(e) =>
              setStatusFilter(e.target.value === "" ? null : Number(e.target.value))
            }
          >
            <option value="">Tümü</option>
            {EXAM_STATUS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading-center">
          <span className="admin-spinner" />
        </div>
      ) : list.length === 0 ? (
        <div className="admin-empty-state">
          Henüz sınav yok. &quot;Yeni Sınav&quot; ile ekleyebilirsiniz.
        </div>
      ) : (
        <div className="admin-card admin-card-elevated">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Başlık</th>
                  <th>Kategori</th>
                  <th>Durum</th>
                  <th>Süre</th>
                  <th>Başlangıç</th>
                  <th>Soru</th>
                  <th className="text-right">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <tr key={item.id}>
                    <td className="font-medium">{item.title}</td>
                    <td className="text-slate-600 text-sm">
                      {item.categoryNameSnapshot || item.categoryCodeSnapshot || "—"}
                    </td>
                    <td>
                      <span
                        className={`admin-badge admin-badge-${statusColor(item.status)}`}
                      >
                        {statusLabel(item.status)}
                      </span>
                      {item.isLocked && (
                        <Lock size={12} className="inline ml-1 text-amber-500" />
                      )}
                    </td>
                    <td>{item.durationMinutes} dk</td>
                    <td className="text-slate-500 text-sm">
                      {formatDate(item.startsAt)}
                    </td>
                    <td>{item.assignedQuestionCount ?? 0} / {(item.blueprint?.totalQuestionCount ?? 0)}</td>
                    <td className="text-right">
                      <div className="admin-exam-actions">
                        <button
                          type="button"
                          onClick={() => openView(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Görüntüle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEdit(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Düzenle"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openStatusModal(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Durum değiştir"
                        >
                          <ListOrdered size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openManageModal(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Yönet (bölüm / soru atama)"
                        >
                          <Settings2 size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openSchedule(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon"
                          title="Tarih"
                        >
                          <Calendar size={18} />
                        </button>
                        {item.status === 0 && (
                          <button
                            type="button"
                            onClick={() => handlePublish(item)}
                            disabled={submitting}
                            className="admin-btn admin-btn-ghost admin-btn-icon text-emerald-600"
                            title="Yayınla"
                          >
                            <Send size={18} />
                          </button>
                        )}
                        {item.status === 2 && (
                          <button
                            type="button"
                            onClick={() => handleUnpublish(item)}
                            disabled={submitting}
                            className="admin-btn admin-btn-ghost admin-btn-icon"
                            title="Yayından kaldır"
                          >
                            <XCircle size={18} />
                          </button>
                        )}
                        {!item.isLocked && item.status === 0 && (
                          <button
                            type="button"
                            onClick={() => handleLock(item)}
                            disabled={submitting}
                            className="admin-btn admin-btn-ghost admin-btn-icon text-amber-600"
                            title="Kilitle"
                          >
                            <Lock size={18} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openDelete(item)}
                          className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50"
                          title="Sil"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Modal: Create */}
      {modal === "create" && (
        <ExamFormModal
          form={form}
          setForm={setForm}
          categories={categories}
          subCategories={subCategories}
          publishers={publishers}
          lessons={lessons}
          addSection={addSection}
          removeSection={removeSection}
          addQuota={addQuota}
          removeQuota={removeQuota}
          updateSection={updateSection}
          updateQuota={updateQuota}
          onSubmit={handleCreate}
          onClose={closeModal}
          submitting={submitting}
          locked={false}
          title="Yeni Sınav"
        />
      )}

      {/* Modal: Edit */}
      {modal === "edit" && selected && (
        <ExamFormModal
          form={form}
          setForm={setForm}
          categories={categories}
          subCategories={subCategories}
          publishers={publishers}
          lessons={lessons}
          addSection={addSection}
          removeSection={removeSection}
          addQuota={addQuota}
          removeQuota={removeQuota}
          updateSection={updateSection}
          updateQuota={updateQuota}
          onSubmit={handleUpdate}
          onClose={closeModal}
          submitting={submitting}
          locked={selected.isLocked}
          title="Sınav Düzenle"
        />
      )}

      {/* Modal: View */}
      {modal === "view" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal admin-modal-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Sınav Detayı</div>
            <div className="admin-modal-body space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <h3 className="font-semibold text-slate-800">{selected.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{selected.description}</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                <div>
                  <span className="text-slate-500">Durum:</span>{" "}
                  {statusLabel(selected.status)}
                </div>
                <div>
                  <span className="text-slate-500">Süre:</span>{" "}
                  {selected.durationMinutes} dk
                </div>
                <div>
                  <span className="text-slate-500">Başlangıç:</span>{" "}
                  {formatDate(selected.startsAt)}
                </div>
                <div>
                  <span className="text-slate-500">Bitiş:</span>{" "}
                  {formatDate(selected.endsAt)}
                </div>
                <div>
                  <span className="text-slate-500">Kategori:</span>{" "}
                  {selected.categoryNameSnapshot || "—"}
                </div>
                <div>
                  <span className="text-slate-500">Soru:</span>{" "}
                  {selected.assignedQuestionCount ?? 0} /{" "}
                  {selected.blueprint?.totalQuestionCount ?? 0}
                </div>
                {selected.isLocked && (
                  <div className="text-amber-600 font-medium">🔒 Kilitli</div>
                )}
              </div>
              {selected.instructions && (
                <div>
                  <div className="font-medium text-slate-700">Talimatlar</div>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">
                    {selected.instructions}
                  </p>
                </div>
              )}
              {selected.sections?.length > 0 && (
                <div>
                  <div className="font-medium text-slate-700 mb-2">Bölümler</div>
                  <ul className="space-y-2">
                    {selected.sections.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600">
                        {s.name} — {s.durationMinutes} dk, {s.questionCountTarget} soru
                        {s.quotas?.length > 0 && (
                          <span className="text-slate-500 ml-2">
                            ({s.quotas.length} kota)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="admin-btn admin-btn-secondary"
              >
                Kapat
              </button>
              {!selected.isLocked && (
                <button
                  type="button"
                  onClick={() => openEdit(selected)}
                  className="admin-btn admin-btn-primary"
                >
                  Düzenle
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Schedule */}
      {modal === "schedule" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Sınav Tarihleri</div>
            <form onSubmit={handleSchedule}>
              <div className="admin-modal-body space-y-4">
                <div className="admin-form-group">
                  <label className="admin-label">Başlangıç</label>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={scheduleForm.startsAt}
                    onChange={(e) =>
                      setScheduleForm((f) => ({ ...f, startsAt: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Bitiş</label>
                  <input
                    type="datetime-local"
                    className="admin-input"
                    value={scheduleForm.endsAt}
                    onChange={(e) =>
                      setScheduleForm((f) => ({ ...f, endsAt: e.target.value }))
                    }
                  />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Durum</label>
                  <select
                    className="admin-input"
                    value={scheduleForm.status}
                    onChange={(e) =>
                      setScheduleForm((f) => ({
                        ...f,
                        status: Number(e.target.value),
                      }))
                    }
                  >
                    {EXAM_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={closeModal}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Güncelleniyor…" : "Güncelle"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete */}
      {modal === "delete" && selected && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Sınavı Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.title}&quot; sınavını kalıcı olarak silmek istediğinize
                emin misiniz? Bu işlem geri alınamaz.
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={closeModal}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "Siliniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Durum değiştir */}
      {statusModalExam && (
        <div className="admin-modal-backdrop" onClick={closeStatusModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Sınav durumunu değiştir</div>
            <form onSubmit={handleSetStatus}>
              <div className="admin-modal-body space-y-4">
                <p className="text-slate-600 text-sm">&quot;{statusModalExam.title}&quot;</p>
                <div className="admin-form-group">
                  <label className="admin-label">Yeni durum</label>
                  <select
                    className="admin-input"
                    value={statusForm.status}
                    onChange={(e) => setStatusForm((f) => ({ ...f, status: Number(e.target.value) }))}
                  >
                    {EXAM_STATUS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={closeStatusModal} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Güncelleniyor…" : "Güncelle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Yönet (bölümler + soru atamaları) */}
      {manageExam && (
        <div className="admin-modal-backdrop" onClick={closeManageModal}>
          <div className="admin-modal admin-modal-xl" onClick={(e) => e.stopPropagation()} style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
            <div className="admin-modal-header flex items-center justify-between shrink-0">
              <span>Sınav yönetimi: {manageExam.title}</span>
              <button type="button" onClick={closeManageModal} className="admin-btn admin-btn-ghost admin-btn-icon">×</button>
            </div>
            <div className="flex border-b border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setManageTab("sections")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${manageTab === "sections" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Bölümler
              </button>
              <button
                type="button"
                onClick={() => setManageTab("assignments")}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${manageTab === "assignments" ? "border-emerald-500 text-emerald-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}
              >
                Soru atamaları
              </button>
            </div>
            <div className="admin-modal-body overflow-y-auto flex-1 min-h-0">
              {manageLoading ? (
                <div className="admin-loading-center py-12"><span className="admin-spinner" /></div>
              ) : manageTab === "sections" ? (
                <div className="space-y-6">
                  {manageExam.isLocked && (
                    <p className="text-amber-600 text-sm">Bu sınav kilitli; bölüm ekleyemez veya silemezsiniz.</p>
                  )}
                  {!manageExam.categorySubId && (
                    <p className="text-amber-600 text-sm">Sınavın alt kategorisi belirlenmeli; bölüm atayamazsınız. Sınavı düzenleyip alt kategori seçin.</p>
                  )}
                  {manageExam.categorySubId && !manageExam.isLocked && (
                    <form onSubmit={handleAssignTemplate} className="admin-card p-4">
                      <div className="font-medium text-slate-700 mb-3">Şablon ata (bölüm + soru şablonu)</div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        <div className="col-span-2 sm:col-span-1">
                          <label className="admin-label">Bölüm şablonu</label>
                          <select className="admin-input" value={assignForm.categoriesSectionId} onChange={(e) => setAssignForm((f) => ({ ...f, categoriesSectionId: e.target.value }))} required>
                            <option value="">Seçin</option>
                            {categorySectionsForAssign.map((cs) => (
                              <option key={cs.id} value={cs.id}>{cs.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <label className="admin-label">Soru şablonu</label>
                          <select className="admin-input" value={assignForm.questionsTemplateId} onChange={(e) => setAssignForm((f) => ({ ...f, questionsTemplateId: e.target.value }))} required>
                            <option value="">Seçin</option>
                            {questionTemplatesForAssign.map((qt) => (
                              <option key={qt.id} value={qt.id}>{qt.name} ({qt.totalQuestionCount ?? 0} soru)</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="admin-label">Sıra</label>
                          <input type="number" className="admin-input" min={0} value={assignForm.orderIndex} onChange={(e) => setAssignForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                        </div>
                        <div className="flex items-end">
                          <button type="submit" disabled={submitting || categorySectionsForAssign.length === 0 || questionTemplatesForAssign.length === 0} className="admin-btn admin-btn-primary">Şablon ata</button>
                        </div>
                      </div>
                    </form>
                  )}
                  <div>
                    <div className="font-medium text-slate-700 mb-2">Bölümler ({manageSections.length})</div>
                    {manageSections.length === 0 ? (
                      <p className="text-slate-500 text-sm">Henüz bölüm yok. Yukarıdan şablon atayın.</p>
                    ) : (
                      <ul className="space-y-2">
                        {manageSections.map((sec) => (
                          <li key={sec.id} className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <div>
                              <span className="font-medium">{sec.name}</span>
                              <span className="text-slate-500 text-sm ml-2">
                                {sec.questionsTemplate ? ` — ${sec.questionsTemplate.name} (${sec.questionsTemplate.totalQuestionCount ?? 0} soru)` : ""}
                                {sec.durationMinutes != null ? `, ${sec.durationMinutes} dk` : ""}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {sectionEditForm?.id === sec.id ? (
                                <>
                                  <input type="number" className="admin-input w-16" min={0} value={sectionEditForm.orderIndex} onChange={(e) => setSectionEditForm((f) => ({ ...f, orderIndex: e.target.value }))} />
                                  <input type="text" className="admin-input w-40 font-mono text-xs" placeholder="Zorluk JSON" value={sectionEditForm.difficultyMix ?? ""} onChange={(e) => setSectionEditForm((f) => ({ ...f, difficultyMix: e.target.value }))} />
                                  <button type="button" onClick={() => handleUpdateSectionOrder(sec.id, Number(sectionEditForm.orderIndex), sectionEditForm.difficultyMix?.trim() || null)} disabled={submitting} className="admin-btn admin-btn-primary admin-btn-sm">Kaydet</button>
                                  <button type="button" onClick={() => setSectionEditForm(null)} className="admin-btn admin-btn-ghost admin-btn-sm">İptal</button>
                                </>
                              ) : (
                                <>
                                  {!manageExam.isLocked && (
                                    <button type="button" onClick={() => setSectionEditForm({ id: sec.id, orderIndex: sec.orderIndex ?? 0, difficultyMix: sec.difficultyMix ?? "" })} className="admin-btn admin-btn-ghost admin-btn-icon" title="Sıra / zorluk düzenle"><Pencil size={14} /></button>
                                  )}
                                  {!manageExam.isLocked && (
                                    <button type="button" onClick={() => handleDeleteSection(sec.id)} disabled={submitting} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600" title="Bölümü kaldır"><Trash2 size={16} /></button>
                                  )}
                                </>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {manageExam.isLocked && (
                    <p className="text-amber-600 text-sm">Bu sınav kilitli; soru ataması ekleyemez veya kaldıramazsınız.</p>
                  )}
                  {!manageExam.isLocked && (
                    <form onSubmit={handleAddAssignment} className="admin-card p-4">
                      <div className="font-medium text-slate-700 mb-3">Soru ata</div>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="flex-1 min-w-[200px]">
                          <label className="admin-label">Soru ID (GUID)</label>
                          <input type="text" className="admin-input font-mono text-sm" placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={assignmentForm.questionId} onChange={(e) => setAssignmentForm((f) => ({ ...f, questionId: e.target.value }))} />
                        </div>
                        <div className="w-48">
                          <label className="admin-label">Bölüm</label>
                          <select className="admin-input" value={assignmentForm.sectionId} onChange={(e) => setAssignmentForm((f) => ({ ...f, sectionId: e.target.value }))}>
                            <option value="">Seçin</option>
                            {manageSections.map((s) => (
                              <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="w-24">
                          <label className="admin-label">Sıra</label>
                          <input type="number" className="admin-input" value={assignmentForm.orderIndex} onChange={(e) => setAssignmentForm((f) => ({ ...f, orderIndex: e.target.value }))} min={0} />
                        </div>
                        <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">Soru ata</button>
                      </div>
                    </form>
                  )}
                  <div>
                    <div className="font-medium text-slate-700 mb-2">Atanmış sorular ({manageAssignments.length})</div>
                    {manageAssignments.length === 0 ? (
                      <p className="text-slate-500 text-sm">Henüz atanmış soru yok.</p>
                    ) : (
                      <div className="admin-table-wrapper">
                        <table className="admin-table">
                          <thead>
                            <tr>
                              <th>Soru ID</th>
                              <th>Bölüm ID</th>
                              <th>Sıra</th>
                              {!manageExam.isLocked && <th className="w-20" />}
                            </tr>
                          </thead>
                          <tbody>
                            {manageAssignments.map((a) => (
                              <tr key={a.id}>
                                <td className="font-mono text-xs">{a.questionId}</td>
                                <td className="font-mono text-xs">{a.sectionId}</td>
                                <td>{a.orderIndex ?? "—"}</td>
                                {!manageExam.isLocked && (
                                  <td>
                                    <button type="button" onClick={() => handleDeleteAssignment(a.id)} disabled={submitting} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600"><Trash2 size={14} /></button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

function ExamFormModal({
  form,
  setForm,
  categories,
  subCategories,
  publishers,
  lessons,
  addSection,
  removeSection,
  addQuota,
  removeQuota,
  updateSection,
  updateQuota,
  onSubmit,
  onClose,
  submitting,
  locked,
  title,
}) {
  const canEditStructure = !locked;

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal admin-modal-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="admin-modal-header">{title}</div>
        <form onSubmit={onSubmit}>
          <div className="admin-modal-body space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="admin-form-row admin-form-row-2">
              <div className="admin-form-group">
                <label className="admin-label admin-label-required">Başlık</label>
                <input
                  type="text"
                  className="admin-input"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Yayınevi</label>
                <select
                  className="admin-input"
                  value={form.publisherId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, publisherId: e.target.value }))
                  }
                >
                  <option value="">Seçin</option>
                  {publishers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Açıklama</label>
              <textarea
                className="admin-input min-h-[60px]"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Talimatlar</label>
              <textarea
                className="admin-input min-h-[60px]"
                value={form.instructions}
                onChange={(e) =>
                  setForm((f) => ({ ...f, instructions: e.target.value }))
                }
              />
            </div>
            <div className="admin-form-row admin-form-row-3">
              <div className="admin-form-group">
                <label className="admin-label">Kategori</label>
                <select
                  className="admin-input"
                  value={form.categoryId}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      categoryId: e.target.value,
                      categorySubId: "",
                    }))
                  }
                >
                  <option value="">Seçin</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Alt Kategori</label>
                <select
                  className="admin-input"
                  value={form.categorySubId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, categorySubId: e.target.value }))
                  }
                  disabled={!form.categoryId}
                >
                  <option value="">
                    {form.categoryId ? "Seçin (opsiyonel)" : "Önce kategori seçin"}
                  </option>
                  {(subCategories || []).filter((s) => s.isActive !== false).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Süre (dk)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={form.durationMinutes}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      durationMinutes: e.target.value,
                    }))
                  }
                  min={1}
                />
              </div>
            </div>
            <div className="admin-form-row admin-form-row-3">
              <div className="admin-form-group">
                <label className="admin-label">Başlangıç</label>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={form.startsAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, startsAt: e.target.value }))
                  }
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Bitiş</label>
                <input
                  type="datetime-local"
                  className="admin-input"
                  value={form.endsAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, endsAt: e.target.value }))
                  }
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Kota</label>
                <input
                  type="number"
                  className="admin-input"
                  value={form.participationQuota}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      participationQuota: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="admin-form-row admin-form-row-3">
              <div className="admin-form-group">
                <label className="admin-label">Grace (sn)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={form.graceSeconds}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, graceSeconds: e.target.value }))
                  }
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-label">Erişim (gün)</label>
                <input
                  type="number"
                  className="admin-input"
                  value={form.accessDurationDays}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      accessDurationDays: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="admin-form-group flex items-end">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.isAdaptive}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, isAdaptive: e.target.checked }))
                    }
                  />
                  Adaptif
                </label>
              </div>
            </div>

            {canEditStructure && (
              <>
                <div className="border-t border-slate-200 pt-4">
                  <div className="font-medium text-slate-700 mb-2">Şablon</div>
                  <div className="admin-form-row admin-form-row-2">
                    <div className="admin-form-group">
                      <label className="admin-label">Toplam soru</label>
                      <input
                        type="number"
                        className="admin-input"
                        value={form.blueprint?.totalQuestionCount ?? 20}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            blueprint: {
                              ...f.blueprint,
                              totalQuestionCount: e.target.value,
                            },
                          }))
                        }
                        min={1}
                      />
                    </div>
                    <div className="admin-form-group">
                      <label className="admin-label">Yanlış kuralı</label>
                      <select
                        className="admin-input"
                        value={form.blueprint?.negativeMarkingRule ?? "4W1R"}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            blueprint: {
                              ...f.blueprint,
                              negativeMarkingRule: e.target.value,
                            },
                          }))
                        }
                      >
                        {NEGATIVE_MARKING.map((n) => (
                          <option key={n.value} value={n.value}>
                            {n.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-700">Bölümler</div>
                    <button
                      type="button"
                      onClick={addSection}
                      className="admin-btn admin-btn-ghost admin-btn-icon text-sm"
                    >
                      <Plus size={16} /> Bölüm Ekle
                    </button>
                  </div>
                  {form.sections.map((sec, si) => (
                    <div
                      key={si}
                      className="border border-slate-200 rounded-lg p-3 mb-3 bg-slate-50/50"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Bölüm {si + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeSection(si)}
                          disabled={form.sections.length <= 1}
                          className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 text-xs"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-2">
                        <input
                          type="text"
                          className="admin-input"
                          placeholder="Bölüm adı"
                          value={sec.name}
                          onChange={(e) =>
                            updateSection(si, "name", e.target.value)
                          }
                        />
                        <input
                          type="number"
                          className="admin-input"
                          placeholder="Süre (dk)"
                          value={sec.durationMinutes}
                          onChange={(e) =>
                            updateSection(
                              si,
                              "durationMinutes",
                              e.target.value
                            )
                          }
                        />
                        <input
                          type="number"
                          className="admin-input"
                          placeholder="Soru sayısı"
                          value={sec.questionCountTarget}
                          onChange={(e) =>
                            updateSection(
                              si,
                              "questionCountTarget",
                              e.target.value
                            )
                          }
                        />
                      </div>
                      <div className="mt-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-500">Kotalar</span>
                          <button
                            type="button"
                            onClick={() => addQuota(si)}
                            className="text-xs text-emerald-600"
                          >
                            + Kota
                          </button>
                        </div>
                        {(sec.quotas || []).map((q, qi) => (
                          <div
                            key={qi}
                            className="flex flex-wrap items-center gap-2 mb-2 p-2 bg-white rounded border"
                          >
                            <select
                              className="admin-input flex-1 min-w-[120px]"
                              value={q.lessonId}
                              onChange={(e) =>
                                updateQuota(si, qi, "lessonId", e.target.value)
                              }
                            >
                              <option value="">Ders seçin</option>
                              {lessons.map((l) => (
                                <option key={l.id} value={l.id}>
                                  {l.name}
                                </option>
                              ))}
                            </select>
                            <input
                              type="text"
                              className="admin-input w-32 font-mono text-xs"
                              placeholder="Alt ders ID"
                              value={q.lessonSubId}
                              onChange={(e) =>
                                updateQuota(si, qi, "lessonSubId", e.target.value)
                              }
                            />
                            <input
                              type="number"
                              className="admin-input w-16"
                              placeholder="Min"
                              value={q.minQuestions}
                              onChange={(e) =>
                                updateQuota(
                                  si,
                                  qi,
                                  "minQuestions",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              className="admin-input w-16"
                              placeholder="Max"
                              value={q.maxQuestions}
                              onChange={(e) =>
                                updateQuota(
                                  si,
                                  qi,
                                  "maxQuestions",
                                  e.target.value
                                )
                              }
                            />
                            <input
                              type="number"
                              className="admin-input w-16"
                              placeholder="Hedef"
                              value={q.targetQuestions}
                              onChange={(e) =>
                                updateQuota(
                                  si,
                                  qi,
                                  "targetQuestions",
                                  e.target.value
                                )
                              }
                            />
                            <button
                              type="button"
                              onClick={() => removeQuota(si, qi)}
                              disabled={(sec.quotas || []).length <= 1}
                              className="admin-btn admin-btn-ghost admin-btn-icon text-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
            {locked && (
              <p className="text-amber-600 text-sm">
                Bu sınav kilitli; şablon ve bölümler değiştirilemez.
              </p>
            )}
          </div>
          <div className="admin-modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="admin-btn admin-btn-secondary"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="admin-btn admin-btn-primary"
            >
              {submitting ? "Kaydediliyor…" : "Kaydet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Exams;
