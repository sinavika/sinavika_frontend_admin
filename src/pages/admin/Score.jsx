import { useEffect, useState, useCallback } from "react";
import {
  Calculator,
  Plus,
  Pencil,
  Trash2,
  Layers,
  Scale,
  Weight,
  FileCheck,
  BarChart3,
  Loader2,
  Sigma,
  ShieldCheck,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getAllScoreProfiles,
  getScoreProfilesBySubId,
  createScoreProfile,
  updateScoreProfile,
  deleteScoreProfile,
} from "@/services/adminCategoryScoreProfileService";
import {
  getAllScoreTypes,
  getScoreTypesByProfileId,
  createScoreType,
  updateScoreType,
  deleteScoreType,
} from "@/services/adminCategoryScoreTypeService";
import {
  getAllScoreTypeWeights,
  getScoreTypeWeightsByScoreTypeId,
  createScoreTypeWeight,
  updateScoreTypeWeight,
  deleteScoreTypeWeight,
} from "@/services/adminCategoryScoreTypeWeightService";
import {
  getAllFormulaComponents,
  getFormulaComponentsByScoreTypeId,
  createFormulaComponent,
  updateFormulaComponent,
  deleteFormulaComponent,
} from "@/services/adminCategoryScoringFormulaComponentService";
import {
  getAllTypeRequirements,
  getTypeRequirementsByScoreTypeId,
  createTypeRequirement,
  updateTypeRequirement,
  deleteTypeRequirement,
} from "@/services/adminCategoryScoringTypeRequirementService";
import { getAllCategories } from "@/services/adminCategoryService";
import { getSubsByCategoryId } from "@/services/adminCategorySubService";
import { getAllCategorySections } from "@/services/adminCategorySectionService";
import {
  getExamsEligibleForScoring,
  calculateExamResults,
} from "@/services/adminScoringService";
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/constants";
import { formatDateShort } from "@/utils/format";

const getApiError = (err) =>
  err.response?.data?.error ||
  err.response?.data?.Error ||
  err.message ||
  ERROR_MESSAGES.FETCH_FAILED;

const TABS = [
  { id: "profiles", label: "Puanlama Profilleri", icon: Layers },
  { id: "types", label: "Puan Türleri", icon: Scale },
  { id: "weights", label: "Puan Türü Ağırlıkları", icon: Weight },
  { id: "formula", label: "Formül Bileşenleri", icon: Sigma },
  { id: "requirements", label: "Puan Türü Koşulları", icon: ShieldCheck },
  { id: "scoring", label: "Skorlar (Sonuç Hesaplama)", icon: FileCheck },
];

// API: 0=Scheduled, 1=Ended, 2=Closed, 3=Archived
const EXAM_STATUS_LABELS = {
  1: "Bitti",
  2: "Kapalı",
  3: "Arşivlendi",
};

const INPUT_TYPES = [
  { value: 0, label: "Net" },
  { value: 1, label: "StandardNet" },
];

const STANDARDIZATION_METHODS = [
  { value: 0, label: "Yöntem 0" },
  { value: 1, label: "Yöntem 1" },
  { value: 2, label: "Yöntem 2" },
];

const MATCH_TYPES = [
  { value: 0, label: "Tümü (All)" },
  { value: 1, label: "Herhangi biri (Any)" },
];

const Score = () => {
  const [activeTab, setActiveTab] = useState("profiles");

  // Ortak veri
  const [categories, setCategories] = useState([]);
  const [categorySubs, setCategorySubs] = useState([]);
  const [createModalSubs, setCreateModalSubs] = useState([]);
  const [sections, setSections] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [scoreTypes, setScoreTypes] = useState([]);
  const [weights, setWeights] = useState([]);
  const [formulaComponents, setFormulaComponents] = useState([]);
  const [requirements, setRequirements] = useState([]);

  // Filtreler
  const [filterCategoryId, setFilterCategoryId] = useState("");
  const [filterCategorySubId, setFilterCategorySubId] = useState("");
  const [filterProfileId, setFilterProfileId] = useState("");
  const [filterScoreTypeId, setFilterScoreTypeId] = useState("");
  const [filterFormulaScoreTypeId, setFilterFormulaScoreTypeId] = useState("");
  const [filterRequirementScoreTypeId, setFilterRequirementScoreTypeId] = useState("");

  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [createModalCategoryId, setCreateModalCategoryId] = useState("");
  const [allScoreTypesForWeights, setAllScoreTypesForWeights] = useState([]);
  const [allScoreTypesForFormula, setAllScoreTypesForFormula] = useState([]);
  const [allScoreTypesForRequirement, setAllScoreTypesForRequirement] = useState([]);
  // Skorlar sekmesi: hesaplamaya uygun sınavlar ve işlem durumu
  const [eligibleExams, setEligibleExams] = useState([]);
  const [loadingScoring, setLoadingScoring] = useState(false);
  const [scoringAction, setScoringAction] = useState(null); // { examId, examTitle } — tek işlem: sonuç + sıralama

  // Form state — Profil
  const [formProfile, setFormProfile] = useState({
    categorySubId: "",
    code: "",
    name: "",
    isActive: true,
    usesNegativeMarking: true,
    negativeMarkingRule: "4Y1D",
    defaultStandardizationMethod: 1,
    cohortFilterJson: "{}",
    roundingPolicyJson: "{}",
    rulesJson: "{}",
    effectiveFrom: "",
    effectiveTo: "",
  });

  // Form state — Puan türü
  const [formType, setFormType] = useState({
    categoryScoringProfileId: "",
    code: "",
    name: "",
    baseScore: 100,
    standardizationOverride: "",
    usesOBP: true,
    obpWeight: "0.12",
    rulesJson: "{}",
  });

  // Form state — Ağırlık
  const [formWeight, setFormWeight] = useState({
    categoryScoreTypeId: "",
    categorySectionId: "",
    weight: "0.5",
    inputType: 1,
  });

  // Form state — Formül bileşeni
  const [formFormula, setFormFormula] = useState({
    categoryScoreTypeId: "",
    sourceCode: "",
    sourceName: "",
    weight: "1",
    orderIndex: 0,
  });

  // Form state — Puan türü koşulu
  const [formRequirement, setFormRequirement] = useState({
    categoryScoreTypeId: "",
    requirementGroupCode: "",
    matchType: 0,
    sourceCode: "",
    sourceName: "",
    minimumValue: "0",
    orderIndex: 0,
  });

  const loadCategories = useCallback(async () => {
    try {
      const data = await getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadSections = useCallback(async () => {
    try {
      const data = await getAllCategorySections();
      setSections(Array.isArray(data) ? data : []);
    } catch {
      setSections([]);
    }
  }, []);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const data = filterCategorySubId
        ? await getScoreProfilesBySubId(filterCategorySubId)
        : await getAllScoreProfiles();
      setProfiles(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setProfiles([]);
    } finally {
      setLoading(false);
    }
  }, [filterCategorySubId]);

  const loadScoreTypes = useCallback(async () => {
    setLoading(true);
    try {
      const data = filterProfileId
        ? await getScoreTypesByProfileId(filterProfileId)
        : await getAllScoreTypes();
      setScoreTypes(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setScoreTypes([]);
    } finally {
      setLoading(false);
    }
  }, [filterProfileId]);

  const loadWeights = useCallback(async () => {
    setLoading(true);
    try {
      const data = filterScoreTypeId
        ? await getScoreTypeWeightsByScoreTypeId(filterScoreTypeId)
        : await getAllScoreTypeWeights();
      setWeights(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setWeights([]);
    } finally {
      setLoading(false);
    }
  }, [filterScoreTypeId]);

  const loadFormulaComponents = useCallback(async () => {
    setLoading(true);
    try {
      const data = filterFormulaScoreTypeId
        ? await getFormulaComponentsByScoreTypeId(filterFormulaScoreTypeId)
        : await getAllFormulaComponents();
      setFormulaComponents(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setFormulaComponents([]);
    } finally {
      setLoading(false);
    }
  }, [filterFormulaScoreTypeId]);

  const loadRequirements = useCallback(async () => {
    setLoading(true);
    try {
      const data = filterRequirementScoreTypeId
        ? await getTypeRequirementsByScoreTypeId(filterRequirementScoreTypeId)
        : await getAllTypeRequirements();
      setRequirements(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setRequirements([]);
    } finally {
      setLoading(false);
    }
  }, [filterRequirementScoreTypeId]);

  const loadEligibleExams = useCallback(async () => {
    setLoadingScoring(true);
    try {
      const data = await getExamsEligibleForScoring();
      setEligibleExams(Array.isArray(data) ? data : []);
    } catch (err) {
      toast.error(getApiError(err));
      setEligibleExams([]);
    } finally {
      setLoadingScoring(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadSections();
  }, [loadCategories, loadSections]);

  useEffect(() => {
    if (activeTab === "profiles") loadProfiles();
  }, [activeTab, loadProfiles]);

  useEffect(() => {
    if (activeTab === "types") loadScoreTypes();
  }, [activeTab, loadScoreTypes]);

  useEffect(() => {
    if (activeTab === "weights") loadWeights();
  }, [activeTab, loadWeights]);

  useEffect(() => {
    if (activeTab === "formula") loadFormulaComponents();
  }, [activeTab, loadFormulaComponents]);

  useEffect(() => {
    if (activeTab === "requirements") loadRequirements();
  }, [activeTab, loadRequirements]);

  useEffect(() => {
    if (activeTab === "scoring") loadEligibleExams();
  }, [activeTab, loadEligibleExams]);

  // Types sekmesinde tüm profilleri dropdown için yükle
  useEffect(() => {
    if (activeTab === "types") {
      getAllScoreProfiles()
        .then((data) => setProfiles(Array.isArray(data) ? data : []))
        .catch(() => setProfiles([]));
    }
  }, [activeTab]);

  // Weights / Formula / Requirements sekmesinde tüm puan türlerini dropdown için yükle
  useEffect(() => {
    if (activeTab === "weights") {
      getAllScoreTypes()
        .then((data) => setAllScoreTypesForWeights(Array.isArray(data) ? data : []))
        .catch(() => setAllScoreTypesForWeights([]));
    } else if (activeTab === "formula") {
      getAllScoreTypes()
        .then((data) => setAllScoreTypesForFormula(Array.isArray(data) ? data : []))
        .catch(() => setAllScoreTypesForFormula([]));
    } else if (activeTab === "requirements") {
      getAllScoreTypes()
        .then((data) => setAllScoreTypesForRequirement(Array.isArray(data) ? data : []))
        .catch(() => setAllScoreTypesForRequirement([]));
    }
  }, [activeTab]);

  useEffect(() => {
    if (!filterCategoryId) {
      setCategorySubs([]);
      setFilterCategorySubId("");
      return;
    }
    getSubsByCategoryId(filterCategoryId).then((data) => {
      setCategorySubs(Array.isArray(data) ? data : []);
      setFilterCategorySubId((prev) => (prev ? prev : ""));
    });
  }, [filterCategoryId]);

  const refreshCurrentTab = () => {
    if (activeTab === "profiles") loadProfiles();
    else if (activeTab === "types") loadScoreTypes();
    else if (activeTab === "weights") loadWeights();
    else if (activeTab === "formula") loadFormulaComponents();
    else if (activeTab === "requirements") loadRequirements();
    else if (activeTab === "scoring") loadEligibleExams();
  };

  // ——— Profil CRUD ———
  const openCreateProfile = () => {
    setCreateModalCategoryId("");
    setFormProfile({
      categorySubId: "",
      code: "",
      name: "",
      isActive: true,
      usesNegativeMarking: true,
      negativeMarkingRule: "4Y1D",
      defaultStandardizationMethod: 1,
      cohortFilterJson: "{}",
      roundingPolicyJson: "{}",
      rulesJson: "{}",
      effectiveFrom: "",
      effectiveTo: "",
    });
    setCreateModalSubs([]);
    setSelected(null);
    setModal("createProfile");
  };

  const openEditProfile = (item) => {
    setSelected(item);
    setFormProfile({
      categorySubId: item.categorySubId ?? "",
      code: item.code ?? "",
      name: item.name ?? "",
      isActive: item.isActive !== false,
      usesNegativeMarking: item.usesNegativeMarking ?? true,
      negativeMarkingRule: item.negativeMarkingRule ?? "4Y1D",
      defaultStandardizationMethod: item.defaultStandardizationMethod ?? 1,
      cohortFilterJson: item.cohortFilterJson ?? "{}",
      roundingPolicyJson: item.roundingPolicyJson ?? "{}",
      rulesJson: item.rulesJson ?? "{}",
      effectiveFrom: item.effectiveFrom
        ? item.effectiveFrom.slice(0, 10)
        : "",
      effectiveTo: item.effectiveTo ? item.effectiveTo.slice(0, 10) : "",
    });
    setModal("editProfile");
  };

  const openDeleteProfile = (item) => {
    setSelected(item);
    setModal("deleteProfile");
  };

  const handleCreateProfile = async (e) => {
    e.preventDefault();
    if (!formProfile.categorySubId) {
      toast.error("Alt kategori seçiniz.");
      return;
    }
    if (!formProfile.code?.trim()) {
      toast.error("Profil kodu zorunludur.");
      return;
    }
    if (!formProfile.name?.trim()) {
      toast.error("Profil adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createScoreProfile({
        categorySubId: formProfile.categorySubId,
        code: formProfile.code.trim(),
        name: formProfile.name.trim(),
        isActive: formProfile.isActive,
        usesNegativeMarking: formProfile.usesNegativeMarking,
        negativeMarkingRule: formProfile.negativeMarkingRule,
        defaultStandardizationMethod: formProfile.defaultStandardizationMethod,
        cohortFilterJson: formProfile.cohortFilterJson || "{}",
        roundingPolicyJson: formProfile.roundingPolicyJson || "{}",
        rulesJson: formProfile.rulesJson || "{}",
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateScoreProfile(selected.id, {
        code: formProfile.code?.trim(),
        name: formProfile.name?.trim(),
        isActive: formProfile.isActive,
        effectiveFrom: formProfile.effectiveFrom || null,
        effectiveTo: formProfile.effectiveTo || null,
        usesNegativeMarking: formProfile.usesNegativeMarking,
        negativeMarkingRule: formProfile.negativeMarkingRule,
        defaultStandardizationMethod: formProfile.defaultStandardizationMethod,
        cohortFilterJson: formProfile.cohortFilterJson,
        roundingPolicyJson: formProfile.roundingPolicyJson,
        rulesJson: formProfile.rulesJson,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteScoreProfile(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Puan türü CRUD ———
  const openCreateType = () => {
    setFormType({
      categoryScoringProfileId: "",
      code: "",
      name: "",
      baseScore: 100,
      standardizationOverride: "",
      usesOBP: true,
      obpWeight: "0.12",
      rulesJson: "{}",
    });
    setSelected(null);
    setModal("createType");
  };

  const openEditType = (item) => {
    setSelected(item);
    setFormType({
      categoryScoringProfileId: item.categoryScoringProfileId ?? "",
      code: item.code ?? "",
      name: item.name ?? "",
      baseScore: item.baseScore ?? 100,
      standardizationOverride:
        item.standardizationOverride != null
          ? String(item.standardizationOverride)
          : "",
      usesOBP: item.usesOBP !== false,
      obpWeight:
        item.obpWeight != null ? String(item.obpWeight) : "0.12",
      rulesJson: item.rulesJson ?? "{}",
    });
    setModal("editType");
  };

  const openDeleteType = (item) => {
    setSelected(item);
    setModal("deleteType");
  };

  const handleCreateType = async (e) => {
    e.preventDefault();
    if (!formType.categoryScoringProfileId) {
      toast.error("Puanlama profili seçiniz.");
      return;
    }
    if (!formType.code?.trim()) {
      toast.error("Puan türü kodu zorunludur.");
      return;
    }
    if (!formType.name?.trim()) {
      toast.error("Puan türü adı zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createScoreType({
        categoryScoringProfileId: formType.categoryScoringProfileId,
        code: formType.code.trim(),
        name: formType.name.trim(),
        baseScore: formType.baseScore,
        standardizationOverride: formType.standardizationOverride || null,
        usesOBP: formType.usesOBP,
        obpWeight: formType.obpWeight,
        rulesJson: formType.rulesJson || "{}",
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateType = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateScoreType(selected.id, {
        code: formType.code?.trim(),
        name: formType.name?.trim(),
        baseScore: formType.baseScore,
        standardizationOverride: formType.standardizationOverride || null,
        usesOBP: formType.usesOBP,
        obpWeight: formType.obpWeight,
        rulesJson: formType.rulesJson,
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteType = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteScoreType(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Ağırlık CRUD ———
  const openCreateWeight = () => {
    setFormWeight({
      categoryScoreTypeId: "",
      categorySectionId: "",
      weight: "0.5",
      inputType: 1,
    });
    setSelected(null);
    setModal("createWeight");
  };

  const openEditWeight = (item) => {
    setSelected(item);
    setFormWeight({
      categoryScoreTypeId: item.categoryScoreTypeId ?? "",
      categorySectionId: item.categorySectionId ?? "",
      weight: item.weight != null ? String(item.weight) : "0.5",
      inputType: item.inputType ?? 1,
    });
    setModal("editWeight");
  };

  const openDeleteWeight = (item) => {
    setSelected(item);
    setModal("deleteWeight");
  };

  const handleCreateWeight = async (e) => {
    e.preventDefault();
    if (!formWeight.categoryScoreTypeId) {
      toast.error("Puan türü seçiniz.");
      return;
    }
    if (!formWeight.categorySectionId) {
      toast.error("Bölüm seçiniz.");
      return;
    }
    const w = parseFloat(formWeight.weight);
    if (isNaN(w) || w < 0) {
      toast.error("Ağırlık geçerli bir sayı olmalıdır (0 veya üzeri).");
      return;
    }
    setSubmitting(true);
    try {
      await createScoreTypeWeight({
        categoryScoreTypeId: formWeight.categoryScoreTypeId,
        categorySectionId: formWeight.categorySectionId,
        weight: formWeight.weight,
        inputType: Number(formWeight.inputType),
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWeight = async (e) => {
    e.preventDefault();
    if (!selected) return;
    const w = parseFloat(formWeight.weight);
    if (isNaN(w) || w < 0) {
      toast.error("Ağırlık geçerli bir sayı olmalıdır.");
      return;
    }
    setSubmitting(true);
    try {
      await updateScoreTypeWeight(selected.id, {
        weight: formWeight.weight,
        inputType: Number(formWeight.inputType),
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWeight = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteScoreTypeWeight(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Formül bileşeni CRUD ———
  const openCreateFormula = () => {
    setFormFormula({
      categoryScoreTypeId: filterFormulaScoreTypeId || "",
      sourceCode: "",
      sourceName: "",
      weight: "1",
      orderIndex: formulaComponents.length,
    });
    setSelected(null);
    setModal("createFormula");
  };

  const openEditFormula = (item) => {
    setSelected(item);
    setFormFormula({
      categoryScoreTypeId: item.categoryScoreTypeId ?? "",
      sourceCode: item.sourceCode ?? "",
      sourceName: item.sourceName ?? "",
      weight: item.weight != null ? String(item.weight) : "1",
      orderIndex: item.orderIndex ?? 0,
    });
    setModal("editFormula");
  };

  const openDeleteFormula = (item) => {
    setSelected(item);
    setModal("deleteFormula");
  };

  const handleCreateFormula = async (e) => {
    e.preventDefault();
    if (!formFormula.categoryScoreTypeId) {
      toast.error("Puan türü seçiniz.");
      return;
    }
    if (!formFormula.sourceCode?.trim()) {
      toast.error("Kaynak kodu zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createFormulaComponent({
        categoryScoreTypeId: formFormula.categoryScoreTypeId,
        sourceCode: formFormula.sourceCode.trim(),
        sourceName: formFormula.sourceName?.trim() ?? "",
        weight: formFormula.weight,
        orderIndex: Number(formFormula.orderIndex) ?? 0,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateFormula = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateFormulaComponent(selected.id, {
        sourceCode: formFormula.sourceCode?.trim(),
        sourceName: formFormula.sourceName?.trim(),
        weight: formFormula.weight,
        orderIndex: Number(formFormula.orderIndex),
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFormula = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteFormulaComponent(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  // ——— Puan türü koşulu CRUD ———
  const openCreateRequirement = () => {
    setFormRequirement({
      categoryScoreTypeId: filterRequirementScoreTypeId || "",
      requirementGroupCode: "",
      matchType: 0,
      sourceCode: "",
      sourceName: "",
      minimumValue: "0",
      orderIndex: requirements.length,
    });
    setSelected(null);
    setModal("createRequirement");
  };

  const openEditRequirement = (item) => {
    setSelected(item);
    setFormRequirement({
      categoryScoreTypeId: item.categoryScoreTypeId ?? "",
      requirementGroupCode: item.requirementGroupCode ?? "",
      matchType: item.matchType ?? 0,
      sourceCode: item.sourceCode ?? "",
      sourceName: item.sourceName ?? "",
      minimumValue: item.minimumValue != null ? String(item.minimumValue) : "0",
      orderIndex: item.orderIndex ?? 0,
    });
    setModal("editRequirement");
  };

  const openDeleteRequirement = (item) => {
    setSelected(item);
    setModal("deleteRequirement");
  };

  const handleCreateRequirement = async (e) => {
    e.preventDefault();
    if (!formRequirement.categoryScoreTypeId) {
      toast.error("Puan türü seçiniz.");
      return;
    }
    if (!formRequirement.requirementGroupCode?.trim()) {
      toast.error("Koşul grubu kodu zorunludur.");
      return;
    }
    setSubmitting(true);
    try {
      await createTypeRequirement({
        categoryScoreTypeId: formRequirement.categoryScoreTypeId,
        requirementGroupCode: formRequirement.requirementGroupCode.trim(),
        matchType: Number(formRequirement.matchType),
        sourceCode: formRequirement.sourceCode?.trim() ?? "",
        sourceName: formRequirement.sourceName?.trim() ?? "",
        minimumValue: formRequirement.minimumValue,
        orderIndex: Number(formRequirement.orderIndex) ?? 0,
      });
      toast.success(SUCCESS_MESSAGES.CREATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateRequirement = async (e) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      await updateTypeRequirement(selected.id, {
        requirementGroupCode: formRequirement.requirementGroupCode?.trim(),
        matchType: Number(formRequirement.matchType),
        sourceCode: formRequirement.sourceCode?.trim(),
        sourceName: formRequirement.sourceName?.trim(),
        minimumValue: formRequirement.minimumValue,
        orderIndex: Number(formRequirement.orderIndex),
      });
      toast.success(SUCCESS_MESSAGES.UPDATE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRequirement = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteTypeRequirement(selected.id);
      toast.success(SUCCESS_MESSAGES.DELETE_SUCCESS);
      setModal(null);
      refreshCurrentTab();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const matchTypeLabel = (val) =>
    MATCH_TYPES.find((x) => x.value === val)?.label ?? val;

  const inputTypeLabel = (val) =>
    INPUT_TYPES.find((x) => x.value === val)?.label ?? val;

  const examStatusLabel = (status) =>
    EXAM_STATUS_LABELS[status] ?? `Durum ${status}`;

  // ——— Skorlar: Sonuç + sıralama hesaplama (tek endpoint) ———
  const openConfirmCalculateResults = (exam) => {
    setSelected(exam);
    setModal("confirmCalculateResults");
  };

  const handleCalculateResults = async () => {
    if (!selected) return;
    setScoringAction({ examId: selected.id, examTitle: selected.title });
    setModal(null);
    try {
      await calculateExamResults(selected.id);
      toast.success("Sınav sonuçları ve sıralama başarıyla hesaplandı ve kaydedildi.");
      loadEligibleExams();
    } catch (err) {
      toast.error(getApiError(err));
    } finally {
      setScoringAction(null);
    }
  };

  const isScoringAction = (examId) => scoringAction?.examId === examId;

  return (
    <div className="admin-page-wrapper score-page">
      <div className="admin-page-header score-page-header">
        <h1 className="admin-page-title score-page-title">
          <Calculator size={28} className="text-emerald-600 score-page-title-icon" />
          Kategori Puanlama (Score)
        </h1>
        <p className="score-page-desc">
          Profiller, puan türleri, ağırlıklar, formül bileşenleri ve puan türü koşullarını yönetin; sonuç hesaplama için Skorlar sekmesini kullanın.
        </p>
      </div>

      <div className="score-tabs">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`score-tab ${activeTab === id ? "score-tab-active" : ""}`}
          >
            <Icon size={18} className="score-tab-icon" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* ——— Sekme: Puanlama Profilleri ——— */}
      {activeTab === "profiles" && (
        <>
          <div className="score-filters">
            <div className="admin-form-group mb-0">
              <label className="admin-label">Ana Kategori</label>
              <select
                className="admin-input score-filter-select"
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
              >
                <option value="">Tümü</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {filterCategoryId && (
              <div className="admin-form-group mb-0">
                <label className="admin-label">Alt Kategori</label>
                <select
                  className="admin-input score-filter-select"
                  value={filterCategorySubId}
                  onChange={(e) => setFilterCategorySubId(e.target.value)}
                >
                  <option value="">Tümü</option>
                  {categorySubs.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="score-filters-actions">
              <button
                type="button"
                onClick={openCreateProfile}
                className="admin-btn admin-btn-primary"
              >
                <Plus size={18} />
                Yeni Profil
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-center">
              <span className="admin-spinner" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="admin-empty-state score-empty-state">
              {filterCategorySubId
                ? "Bu alt kategoriye ait profil bulunamadı."
                : "Henüz puanlama profili yok. \"Yeni Profil\" ile ekleyebilirsiniz."}
            </div>
          ) : (
            <div className="admin-card admin-card-elevated score-card">
              <div className="admin-table-wrapper">
                <table className="admin-table score-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Ad</th>
                      <th>Versiyon</th>
                      <th>Negatif Puan</th>
                      <th>Geçerlilik Başlangıç</th>
                      <th>Geçerlilik Bitiş</th>
                      <th>Durum</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.version ?? "—"}</td>
                        <td>
                          {item.usesNegativeMarking ? "Evet" : "Hayır"}
                          {item.negativeMarkingRule && ` (${item.negativeMarkingRule})`}
                        </td>
                        <td>{item.effectiveFrom ? formatDateShort(item.effectiveFrom) : "—"}</td>
                        <td>{item.effectiveTo ? formatDateShort(item.effectiveTo) : "—"}</td>
                        <td>
                          <span
                            className={
                              item.isActive
                                ? "admin-badge admin-badge-success"
                                : "admin-badge admin-badge-neutral"
                            }
                          >
                            {item.isActive ? "Aktif" : "Pasif"}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="score-row-actions">
                            <button
                              type="button"
                              onClick={() => openEditProfile(item)}
                              className="admin-btn admin-btn-ghost admin-btn-icon"
                              title="Düzenle"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteProfile(item)}
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
        </>
      )}

      {/* ——— Sekme: Puan Türleri ——— */}
      {activeTab === "types" && (
        <>
          <div className="score-filters">
            <div className="admin-form-group mb-0">
              <label className="admin-label">Puanlama Profili</label>
              <select
                className="admin-input score-filter-select"
                value={filterProfileId}
                onChange={(e) => setFilterProfileId(e.target.value)}
              >
                <option value="">Tümü</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="score-filters-actions">
              <button
                type="button"
                onClick={openCreateType}
                className="admin-btn admin-btn-primary"
              >
                <Plus size={18} />
                Yeni Puan Türü
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-center">
              <span className="admin-spinner" />
            </div>
          ) : scoreTypes.length === 0 ? (
            <div className="admin-empty-state score-empty-state">
              {filterProfileId
                ? "Bu profile ait puan türü bulunamadı."
                : "Henüz puan türü yok. \"Yeni Puan Türü\" ile ekleyebilirsiniz."}
            </div>
          ) : (
            <div className="admin-card admin-card-elevated score-card">
              <div className="admin-table-wrapper">
                <table className="admin-table score-table">
                  <thead>
                    <tr>
                      <th>Kod</th>
                      <th>Ad</th>
                      <th>Taban Puan</th>
                      <th>OBP</th>
                      <th>OBP Ağırlık</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scoreTypes.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.code}</td>
                        <td>{item.name}</td>
                        <td>{item.baseScore ?? "—"}</td>
                        <td>{item.usesOBP ? "Evet" : "Hayır"}</td>
                        <td>{item.obpWeight ?? "—"}</td>
                        <td className="text-right">
                          <div className="score-row-actions">
                            <button
                              type="button"
                              onClick={() => openEditType(item)}
                              className="admin-btn admin-btn-ghost admin-btn-icon"
                              title="Düzenle"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteType(item)}
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
        </>
      )}

      {/* ——— Sekme: Puan Türü Ağırlıkları ——— */}
      {activeTab === "weights" && (
        <>
          <div className="score-filters">
            <div className="admin-form-group mb-0">
              <label className="admin-label">Puan Türü</label>
              <select
                className="admin-input score-filter-select"
                value={filterScoreTypeId}
                onChange={(e) => setFilterScoreTypeId(e.target.value)}
              >
                <option value="">Tümü</option>
                {(allScoreTypesForWeights.length ? allScoreTypesForWeights : scoreTypes).map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="score-filters-actions">
              <button
                type="button"
                onClick={openCreateWeight}
                className="admin-btn admin-btn-primary"
              >
                <Plus size={18} />
                Yeni Ağırlık
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-center">
              <span className="admin-spinner" />
            </div>
          ) : weights.length === 0 ? (
            <div className="admin-empty-state score-empty-state">
              {filterScoreTypeId
                ? "Bu puan türüne ait ağırlık bulunamadı."
                : "Henüz puan türü ağırlığı yok. \"Yeni Ağırlık\" ile ekleyebilirsiniz."}
            </div>
          ) : (
            <div className="admin-card admin-card-elevated score-card">
              <div className="admin-table-wrapper">
                <table className="admin-table score-table">
                  <thead>
                    <tr>
                      <th>Puan Türü</th>
                      <th>Bölüm</th>
                      <th>Ağırlık</th>
                      <th>Girdi Tipi</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weights.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.categoryScoreTypeName ?? item.categoryScoreTypeId}</td>
                        <td>{item.categorySectionName ?? item.categorySectionId}</td>
                        <td>{item.weight ?? "—"}</td>
                        <td>{inputTypeLabel(item.inputType)}</td>
                        <td className="text-right">
                          <div className="score-row-actions">
                            <button
                              type="button"
                              onClick={() => openEditWeight(item)}
                              className="admin-btn admin-btn-ghost admin-btn-icon"
                              title="Düzenle"
                            >
                              <Pencil size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteWeight(item)}
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
        </>
      )}

      {/* ——— Sekme: Formül Bileşenleri ——— */}
      {activeTab === "formula" && (
        <>
          <div className="score-filters score-filters-formula">
            <div className="admin-form-group mb-0">
              <label className="admin-label">Puan Türü</label>
              <select
                className="admin-input score-filter-select"
                value={filterFormulaScoreTypeId}
                onChange={(e) => setFilterFormulaScoreTypeId(e.target.value)}
              >
                <option value="">Tümü</option>
                {(allScoreTypesForFormula.length ? allScoreTypesForFormula : scoreTypes).map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="score-filters-actions">
              <button
                type="button"
                onClick={openCreateFormula}
                className="admin-btn admin-btn-primary score-btn-formula"
              >
                <Sigma size={18} />
                Yeni Formül Bileşeni
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-center">
              <span className="admin-spinner" />
            </div>
          ) : formulaComponents.length === 0 ? (
            <div className="admin-empty-state score-empty-state score-section-formula-empty">
              {filterFormulaScoreTypeId
                ? "Bu puan türüne ait formül bileşeni bulunamadı."
                : "Henüz formül bileşeni yok. \"Yeni Formül Bileşeni\" ile ekleyebilirsiniz."}
            </div>
          ) : (
            <div className="admin-card admin-card-elevated score-card score-section-formula">
              <div className="score-section-header">
                <Sigma size={20} className="score-section-header-icon" />
                <h2 className="score-section-title">Formül bileşenleri</h2>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table score-table">
                  <thead>
                    <tr>
                      <th>Kaynak Kod</th>
                      <th>Kaynak Ad</th>
                      <th>Ağırlık</th>
                      <th>Sıra</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formulaComponents.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium"><code className="score-code">{item.sourceCode}</code></td>
                        <td>{item.sourceName ?? "—"}</td>
                        <td>{item.weight ?? "—"}</td>
                        <td>{item.orderIndex ?? 0}</td>
                        <td className="text-right">
                          <div className="score-row-actions">
                            <button type="button" onClick={() => openEditFormula(item)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle">
                              <Pencil size={18} />
                            </button>
                            <button type="button" onClick={() => openDeleteFormula(item)} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50" title="Sil">
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
        </>
      )}

      {/* ——— Sekme: Puan Türü Koşulları ——— */}
      {activeTab === "requirements" && (
        <>
          <div className="score-filters score-filters-requirements">
            <div className="admin-form-group mb-0">
              <label className="admin-label">Puan Türü</label>
              <select
                className="admin-input score-filter-select"
                value={filterRequirementScoreTypeId}
                onChange={(e) => setFilterRequirementScoreTypeId(e.target.value)}
              >
                <option value="">Tümü</option>
                {(allScoreTypesForRequirement.length ? allScoreTypesForRequirement : scoreTypes).map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>
            <div className="score-filters-actions">
              <button
                type="button"
                onClick={openCreateRequirement}
                className="admin-btn admin-btn-primary score-btn-requirement"
              >
                <ShieldCheck size={18} />
                Yeni Koşul
              </button>
            </div>
          </div>

          {loading ? (
            <div className="admin-loading-center">
              <span className="admin-spinner" />
            </div>
          ) : requirements.length === 0 ? (
            <div className="admin-empty-state score-empty-state score-section-requirement-empty">
              {filterRequirementScoreTypeId
                ? "Bu puan türüne ait koşul bulunamadı."
                : "Henüz puan türü koşulu yok. \"Yeni Koşul\" ile ekleyebilirsiniz."}
            </div>
          ) : (
            <div className="admin-card admin-card-elevated score-card score-section-requirements">
              <div className="score-section-header">
                <ShieldCheck size={20} className="score-section-header-icon" />
                <h2 className="score-section-title">Puan türü koşulları</h2>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table score-table">
                  <thead>
                    <tr>
                      <th>Grup Kodu</th>
                      <th>Eşleşme</th>
                      <th>Kaynak Kod</th>
                      <th>Kaynak Ad</th>
                      <th>Min. Değer</th>
                      <th>Sıra</th>
                      <th className="text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requirements.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium"><code className="score-code">{item.requirementGroupCode}</code></td>
                        <td><span className="score-badge-match">{matchTypeLabel(item.matchType)}</span></td>
                        <td><code className="score-code">{item.sourceCode ?? "—"}</code></td>
                        <td>{item.sourceName ?? "—"}</td>
                        <td>{item.minimumValue ?? "—"}</td>
                        <td>{item.orderIndex ?? 0}</td>
                        <td className="text-right">
                          <div className="score-row-actions">
                            <button type="button" onClick={() => openEditRequirement(item)} className="admin-btn admin-btn-ghost admin-btn-icon" title="Düzenle">
                              <Pencil size={18} />
                            </button>
                            <button type="button" onClick={() => openDeleteRequirement(item)} className="admin-btn admin-btn-ghost admin-btn-icon text-red-600 hover:bg-red-50" title="Sil">
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
        </>
      )}

      {/* ——— Sekme: Skorlar (Sonuç Hesaplama) ——— */}
      {activeTab === "scoring" && (
        <>
          <div className="score-scoring-intro">
            <BarChart3 size={22} className="score-scoring-intro-icon" aria-hidden />
            <div className="score-scoring-intro-content">
              <p className="score-scoring-intro-title">Sonuç ve sıralama hesaplama</p>
              <p>
                Kapalı, bitmiş veya arşivlenmiş sınavlar için <strong>Sonuç ve Sıralama Hesapla</strong> ile
                net, standart net, puanlar ve sıralama tek seferde hesaplanır. Her sınav için yalnızca bir kez çalıştırın.
              </p>
            </div>
          </div>

          {loadingScoring ? (
            <div className="admin-loading-center score-scoring-loading">
              <span className="admin-spinner" />
              <span className="score-scoring-loading-text">Sınavlar yükleniyor…</span>
            </div>
          ) : eligibleExams.length === 0 ? (
            <div className="admin-empty-state score-empty-state score-scoring-empty">
              Hesaplamaya uygun (kapalı / bitmiş / arşivlenmiş) sınav bulunamadı.
            </div>
          ) : (
            <div className="admin-card admin-card-elevated score-card score-scoring-card">
              <div className="score-scoring-card-header">
                <h2 className="score-scoring-card-title">Hesaplamaya Uygun Sınavlar</h2>
              </div>
              <div className="admin-table-wrapper">
                <table className="admin-table score-table score-scoring-table">
                  <thead>
                    <tr>
                      <th>Sınav</th>
                      <th>Durum</th>
                      <th className="text-right score-scoring-actions-col">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eligibleExams.map((exam) => (
                      <tr key={exam.id} className="score-scoring-row">
                        <td className="font-medium score-scoring-exam-title">{exam.title}</td>
                        <td>
                          <span
                            className={`admin-badge score-scoring-status-badge score-scoring-status-badge--${
                              exam.status === 1 ? "ended" : exam.status === 3 ? "archived" : "closed"
                            }`}
                          >
                            {examStatusLabel(exam.status)}
                          </span>
                        </td>
                        <td className="text-right">
                          <div className="score-scoring-row-actions">
                            <button
                              type="button"
                              onClick={() => openConfirmCalculateResults(exam)}
                              disabled={!!scoringAction}
                              className="admin-btn admin-btn-primary score-scoring-btn score-scoring-btn-calculate"
                              title="Sonuç ve sıralama hesapla (net, puan, sıra)"
                            >
                              {isScoringAction(exam.id) ? (
                                <>
                                  <Loader2 size={18} className="score-scoring-btn-spinner" aria-hidden />
                                  <span>Hesaplanıyor…</span>
                                </>
                              ) : (
                                <>
                                  <Calculator size={18} aria-hidden />
                                  <span>Sonuç ve Sıralama Hesapla</span>
                                </>
                              )}
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
        </>
      )}

      {/* ——— Modals: Profil ——— */}
      {modal === "createProfile" && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni Puanlama Profili</div>
            <form onSubmit={handleCreateProfile}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Ana Kategori</label>
                  <select
                    className="admin-input"
                    value={createModalCategoryId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setCreateModalCategoryId(id);
                      if (id) {
                        getSubsByCategoryId(id).then((data) =>
                          setCreateModalSubs(Array.isArray(data) ? data : [])
                        );
                      } else {
                        setCreateModalSubs([]);
                        setFormProfile((f) => ({ ...f, categorySubId: "" }));
                      }
                    }}
                  >
                    <option value="">Seçin</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Alt Kategori</label>
                  <select
                    className="admin-input"
                    value={formProfile.categorySubId}
                    onChange={(e) =>
                      setFormProfile((f) => ({ ...f, categorySubId: e.target.value }))
                    }
                    required
                  >
                    <option value="">Seçin</option>
                    {createModalSubs.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formProfile.code}
                      onChange={(e) =>
                        setFormProfile((f) => ({ ...f, code: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formProfile.name}
                      onChange={(e) =>
                        setFormProfile((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Negatif puanlama</label>
                    <select
                      className="admin-input"
                      value={formProfile.usesNegativeMarking ? "1" : "0"}
                      onChange={(e) =>
                        setFormProfile((f) => ({
                          ...f,
                          usesNegativeMarking: e.target.value === "1",
                        }))
                      }
                    >
                      <option value="1">Evet</option>
                      <option value="0">Hayır</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Negatif kural (örn. 4Y1D)</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formProfile.negativeMarkingRule}
                      onChange={(e) =>
                        setFormProfile((f) => ({
                          ...f,
                          negativeMarkingRule: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Varsayılan standartlaştırma</label>
                  <select
                    className="admin-input"
                    value={formProfile.defaultStandardizationMethod}
                    onChange={(e) =>
                      setFormProfile((f) => ({
                        ...f,
                        defaultStandardizationMethod: parseInt(e.target.value, 10),
                      }))
                    }
                  >
                    {STANDARDIZATION_METHODS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-profile-active"
                    checked={formProfile.isActive}
                    onChange={(e) =>
                      setFormProfile((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="create-profile-active" className="text-sm">
                    Aktif
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Kaydediliyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "editProfile" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Profil Düzenle</div>
            <form onSubmit={handleUpdateProfile}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formProfile.code}
                      onChange={(e) =>
                        setFormProfile((f) => ({ ...f, code: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formProfile.name}
                      onChange={(e) =>
                        setFormProfile((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Geçerlilik başlangıç</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formProfile.effectiveFrom}
                      onChange={(e) =>
                        setFormProfile((f) => ({
                          ...f,
                          effectiveFrom: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Geçerlilik bitiş</label>
                    <input
                      type="date"
                      className="admin-input"
                      value={formProfile.effectiveTo}
                      onChange={(e) =>
                        setFormProfile((f) => ({
                          ...f,
                          effectiveTo: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Negatif puanlama</label>
                    <select
                      className="admin-input"
                      value={formProfile.usesNegativeMarking ? "1" : "0"}
                      onChange={(e) =>
                        setFormProfile((f) => ({
                          ...f,
                          usesNegativeMarking: e.target.value === "1",
                        }))
                      }
                    >
                      <option value="1">Evet</option>
                      <option value="0">Hayır</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Standartlaştırma</label>
                    <select
                      className="admin-input"
                      value={formProfile.defaultStandardizationMethod}
                      onChange={(e) =>
                        setFormProfile((f) => ({
                          ...f,
                          defaultStandardizationMethod: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {STANDARDIZATION_METHODS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-profile-active"
                    checked={formProfile.isActive}
                    onChange={(e) =>
                      setFormProfile((f) => ({ ...f, isActive: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="edit-profile-active" className="text-sm">
                    Aktif
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal(null)}
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

      {modal === "deleteProfile" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Profil Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; profilini silmek istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteProfile}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "İşleniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Modals: Puan türü ——— */}
      {modal === "createType" && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni Puan Türü</div>
            <form onSubmit={handleCreateType}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Puanlama Profili</label>
                  <select
                    className="admin-input"
                    value={formType.categoryScoringProfileId}
                    onChange={(e) =>
                      setFormType((f) => ({
                        ...f,
                        categoryScoringProfileId: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Seçin</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formType.code}
                      onChange={(e) =>
                        setFormType((f) => ({ ...f, code: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formType.name}
                      onChange={(e) =>
                        setFormType((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Taban puan</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formType.baseScore}
                      onChange={(e) =>
                        setFormType((f) => ({
                          ...f,
                          baseScore: parseInt(e.target.value, 10) || 100,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Standartlaştırma override</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formType.standardizationOverride}
                      onChange={(e) =>
                        setFormType((f) => ({
                          ...f,
                          standardizationOverride: e.target.value,
                        }))
                      }
                      placeholder="Boş bırakılabilir"
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">OBP kullan</label>
                    <select
                      className="admin-input"
                      value={formType.usesOBP ? "1" : "0"}
                      onChange={(e) =>
                        setFormType((f) => ({
                          ...f,
                          usesOBP: e.target.value === "1",
                        }))
                      }
                    >
                      <option value="1">Evet</option>
                      <option value="0">Hayır</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">OBP ağırlık</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formType.obpWeight}
                      onChange={(e) =>
                        setFormType((f) => ({ ...f, obpWeight: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="create-type-obp"
                    checked={formType.usesOBP}
                    onChange={(e) =>
                      setFormType((f) => ({ ...f, usesOBP: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="create-type-obp" className="text-sm">
                    OBP kullan
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Kaydediliyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "editType" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Puan Türü Düzenle</div>
            <form onSubmit={handleUpdateType}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Kod</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formType.code}
                      onChange={(e) =>
                        setFormType((f) => ({ ...f, code: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Ad</label>
                    <input
                      type="text"
                      className="admin-input"
                      value={formType.name}
                      onChange={(e) =>
                        setFormType((f) => ({ ...f, name: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Taban puan</label>
                    <input
                      type="number"
                      className="admin-input"
                      value={formType.baseScore}
                      onChange={(e) =>
                        setFormType((f) => ({
                          ...f,
                          baseScore: parseInt(e.target.value, 10) || 100,
                        }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">OBP ağırlık</label>
                    <input
                      type="number"
                      step="0.01"
                      className="admin-input"
                      value={formType.obpWeight}
                      onChange={(e) =>
                        setFormType((f) => ({ ...f, obpWeight: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-type-obp"
                    checked={formType.usesOBP}
                    onChange={(e) =>
                      setFormType((f) => ({ ...f, usesOBP: e.target.checked }))
                    }
                    className="rounded border-slate-300 text-emerald-600"
                  />
                  <label htmlFor="edit-type-obp" className="text-sm">
                    OBP kullan
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal(null)}
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

      {modal === "deleteType" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Puan Türü Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                &quot;{selected.name}&quot; puan türünü silmek istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteType}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "İşleniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Modals: Ağırlık ——— */}
      {modal === "createWeight" && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="admin-modal admin-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Yeni Puan Türü Ağırlığı</div>
            <form onSubmit={handleCreateWeight}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Puan Türü</label>
                  <select
                    className="admin-input"
                    value={formWeight.categoryScoreTypeId}
                    onChange={(e) =>
                      setFormWeight((f) => ({
                        ...f,
                        categoryScoreTypeId: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Seçin</option>
                    {(allScoreTypesForWeights.length ? allScoreTypesForWeights : scoreTypes).map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Bölüm (CategorySection)</label>
                  <select
                    className="admin-input"
                    value={formWeight.categorySectionId}
                    onChange={(e) =>
                      setFormWeight((f) => ({
                        ...f,
                        categorySectionId: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Seçin</option>
                    {sections.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name ?? s.id}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Ağırlık</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="admin-input"
                      value={formWeight.weight}
                      onChange={(e) =>
                        setFormWeight((f) => ({ ...f, weight: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Girdi tipi</label>
                    <select
                      className="admin-input"
                      value={formWeight.inputType}
                      onChange={(e) =>
                        setFormWeight((f) => ({
                          ...f,
                          inputType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {INPUT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="admin-btn admin-btn-secondary"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="admin-btn admin-btn-primary"
                >
                  {submitting ? "Kaydediliyor…" : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "editWeight" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div
            className="admin-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">Ağırlık Düzenle</div>
            <form onSubmit={handleUpdateWeight}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Ağırlık</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="admin-input"
                      value={formWeight.weight}
                      onChange={(e) =>
                        setFormWeight((f) => ({ ...f, weight: e.target.value }))
                      }
                    />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Girdi tipi</label>
                    <select
                      className="admin-input"
                      value={formWeight.inputType}
                      onChange={(e) =>
                        setFormWeight((f) => ({
                          ...f,
                          inputType: parseInt(e.target.value, 10),
                        }))
                      }
                    >
                      {INPUT_TYPES.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button
                  type="button"
                  onClick={() => setModal(null)}
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

      {modal === "deleteWeight" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Ağırlık Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600">
                Bu ağırlık kaydını silmek istediğinize emin misiniz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleDeleteWeight}
                disabled={submitting}
                className="admin-btn admin-btn-danger"
              >
                {submitting ? "İşleniyor…" : "Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Modals: Formül bileşeni ——— */}
      {modal === "createFormula" && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal admin-modal-lg score-modal-formula" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <Sigma size={20} className="mr-2" />
              Yeni Formül Bileşeni
            </div>
            <form onSubmit={handleCreateFormula}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Puan Türü</label>
                  <select
                    className="admin-input"
                    value={formFormula.categoryScoreTypeId}
                    onChange={(e) => setFormFormula((f) => ({ ...f, categoryScoreTypeId: e.target.value }))}
                    required
                  >
                    <option value="">Seçin</option>
                    {(allScoreTypesForFormula.length ? allScoreTypesForFormula : scoreTypes).map((st) => (
                      <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kaynak kodu</label>
                    <input type="text" className="admin-input" value={formFormula.sourceCode} onChange={(e) => setFormFormula((f) => ({ ...f, sourceCode: e.target.value }))} placeholder="MAT, FEN" required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Kaynak adı</label>
                    <input type="text" className="admin-input" value={formFormula.sourceName} onChange={(e) => setFormFormula((f) => ({ ...f, sourceName: e.target.value }))} placeholder="Matematik Net" />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Ağırlık</label>
                    <input type="number" step="0.01" min="0" className="admin-input" value={formFormula.weight} onChange={(e) => setFormFormula((f) => ({ ...f, weight: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min="0" className="admin-input" value={formFormula.orderIndex} onChange={(e) => setFormFormula((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Kaydediliyor…" : "Oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "editFormula" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal admin-modal-lg score-modal-formula" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Formül Bileşenini Düzenle</div>
            <form onSubmit={handleUpdateFormula}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label admin-label-required">Kaynak kodu</label>
                    <input type="text" className="admin-input" value={formFormula.sourceCode} onChange={(e) => setFormFormula((f) => ({ ...f, sourceCode: e.target.value }))} required />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Kaynak adı</label>
                    <input type="text" className="admin-input" value={formFormula.sourceName} onChange={(e) => setFormFormula((f) => ({ ...f, sourceName: e.target.value }))} />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Ağırlık</label>
                    <input type="number" step="0.01" min="0" className="admin-input" value={formFormula.weight} onChange={(e) => setFormFormula((f) => ({ ...f, weight: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min="0" className="admin-input" value={formFormula.orderIndex} onChange={(e) => setFormFormula((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Güncelleniyor…" : "Güncelle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "deleteFormula" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Formül Bileşenini Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600"><strong>{selected.sourceName || selected.sourceCode}</strong> bileşenini silmek istediğinize emin misiniz?</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
              <button type="button" onClick={handleDeleteFormula} disabled={submitting} className="admin-btn admin-btn-danger">{submitting ? "İşleniyor…" : "Sil"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Modals: Puan türü koşulu ——— */}
      {modal === "createRequirement" && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal admin-modal-lg score-modal-requirement" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <ShieldCheck size={20} className="mr-2" />
              Yeni Puan Türü Koşulu
            </div>
            <form onSubmit={handleCreateRequirement}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Puan Türü</label>
                  <select
                    className="admin-input"
                    value={formRequirement.categoryScoreTypeId}
                    onChange={(e) => setFormRequirement((f) => ({ ...f, categoryScoreTypeId: e.target.value }))}
                    required
                  >
                    <option value="">Seçin</option>
                    {(allScoreTypesForRequirement.length ? allScoreTypesForRequirement : scoreTypes).map((st) => (
                      <option key={st.id} value={st.id}>{st.name} ({st.code})</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Koşul grubu kodu</label>
                  <input type="text" className="admin-input" value={formRequirement.requirementGroupCode} onChange={(e) => setFormRequirement((f) => ({ ...f, requirementGroupCode: e.target.value }))} placeholder="MIN_TYT" required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Eşleşme tipi</label>
                  <select
                    className="admin-input"
                    value={formRequirement.matchType}
                    onChange={(e) => setFormRequirement((f) => ({ ...f, matchType: parseInt(e.target.value, 10) }))}
                  >
                    {MATCH_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Kaynak kodu</label>
                    <input type="text" className="admin-input" value={formRequirement.sourceCode} onChange={(e) => setFormRequirement((f) => ({ ...f, sourceCode: e.target.value }))} placeholder="TYT_TR" />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Kaynak adı</label>
                    <input type="text" className="admin-input" value={formRequirement.sourceName} onChange={(e) => setFormRequirement((f) => ({ ...f, sourceName: e.target.value }))} placeholder="TYT Türkçe" />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Minimum değer</label>
                    <input type="number" step="0.01" className="admin-input" value={formRequirement.minimumValue} onChange={(e) => setFormRequirement((f) => ({ ...f, minimumValue: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min="0" className="admin-input" value={formRequirement.orderIndex} onChange={(e) => setFormRequirement((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Kaydediliyor…" : "Oluştur"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "editRequirement" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal admin-modal-lg score-modal-requirement" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Koşulu Düzenle</div>
            <form onSubmit={handleUpdateRequirement}>
              <div className="admin-modal-body score-modal-body">
                <div className="admin-form-group">
                  <label className="admin-label admin-label-required">Koşul grubu kodu</label>
                  <input type="text" className="admin-input" value={formRequirement.requirementGroupCode} onChange={(e) => setFormRequirement((f) => ({ ...f, requirementGroupCode: e.target.value }))} required />
                </div>
                <div className="admin-form-group">
                  <label className="admin-label">Eşleşme tipi</label>
                  <select
                    className="admin-input"
                    value={formRequirement.matchType}
                    onChange={(e) => setFormRequirement((f) => ({ ...f, matchType: parseInt(e.target.value, 10) }))}
                  >
                    {MATCH_TYPES.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Kaynak kodu</label>
                    <input type="text" className="admin-input" value={formRequirement.sourceCode} onChange={(e) => setFormRequirement((f) => ({ ...f, sourceCode: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Kaynak adı</label>
                    <input type="text" className="admin-input" value={formRequirement.sourceName} onChange={(e) => setFormRequirement((f) => ({ ...f, sourceName: e.target.value }))} />
                  </div>
                </div>
                <div className="admin-form-row admin-form-row-2">
                  <div className="admin-form-group">
                    <label className="admin-label">Minimum değer</label>
                    <input type="number" step="0.01" className="admin-input" value={formRequirement.minimumValue} onChange={(e) => setFormRequirement((f) => ({ ...f, minimumValue: e.target.value }))} />
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-label">Sıra</label>
                    <input type="number" min="0" className="admin-input" value={formRequirement.orderIndex} onChange={(e) => setFormRequirement((f) => ({ ...f, orderIndex: parseInt(e.target.value, 10) || 0 }))} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" onClick={() => setModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
                <button type="submit" disabled={submitting} className="admin-btn admin-btn-primary">{submitting ? "Güncelleniyor…" : "Güncelle"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === "deleteRequirement" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">Koşulu Sil</div>
            <div className="admin-modal-body">
              <p className="text-slate-600"><strong>{selected.requirementGroupCode}</strong> — {selected.sourceName || selected.sourceCode} koşulunu silmek istediğinize emin misiniz?</p>
            </div>
            <div className="admin-modal-footer">
              <button type="button" onClick={() => setModal(null)} className="admin-btn admin-btn-secondary">İptal</button>
              <button type="button" onClick={handleDeleteRequirement} disabled={submitting} className="admin-btn admin-btn-danger">{submitting ? "İşleniyor…" : "Sil"}</button>
            </div>
          </div>
        </div>
      )}

      {/* ——— Modals: Skorlar — Sonuç hesaplama / Sıralama onay ——— */}
      {modal === "confirmCalculateResults" && selected && (
        <div className="admin-modal-backdrop" onClick={() => setModal(null)}>
          <div className="admin-modal score-scoring-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header score-scoring-modal-header">
              Sonuç ve Sıralama Hesapla
            </div>
            <div className="admin-modal-body">
              <p className="score-scoring-modal-text">
                <strong>&quot;{selected.title}&quot;</strong> sınavı için tüm katılımcıların sonuçları
                (net, standart net, puan) ve sıralama tek seferde hesaplanacak. Bu işlem uzun sürebilir. Devam etmek istiyor musunuz?
              </p>
            </div>
            <div className="admin-modal-footer">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="admin-btn admin-btn-secondary"
              >
                İptal
              </button>
              <button
                type="button"
                onClick={handleCalculateResults}
                className="admin-btn admin-btn-primary score-scoring-modal-btn-confirm"
              >
                Hesapla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Score;
