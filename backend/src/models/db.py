from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Text, SmallInteger, CHAR, LargeBinary, Numeric, Enum, UniqueConstraint
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class KrollPatient(Base):
    __tablename__ = 'kroll_patient'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    DocID = Column(Integer, ForeignKey('kroll_doctor.id'), nullable=True)       #Can patient have more than one doctor?
    FamilyID = Column(Integer, nullable=True)
    Code = Column(String, nullable=True)           #varchar40
    LastName = Column(String, nullable=False)       #varchar25
    FirstName = Column(String, nullable=False)      #varchar25
    Address1 = Column(String, nullable=True)        #varchar40
    Address2 = Column(String, nullable=True)        #varchar40
    City = Column(String, nullable=True)            #varchar25
    Prov = Column(String, nullable=False)           #varchar2
    Postal = Column(String, nullable=True)          #varchar10
    Country = Column(String, nullable=False)        #varchar20
    Birthday = Column(DateTime, nullable=True)      #datetime
    Sex = Column(CHAR, nullable=False)              #char1
    Language = Column(CHAR, nullable=False)         #char1
    RxTotalsResetDate = Column(DateTime, nullable=True)              #smalldatetime
    TotalDollars = Column(Numeric(precision=9, scale=2), nullable=True) #numeric(9,2)
    TotalRx = Column(Integer, nullable=True)        #int
    Weight = Column(String, nullable=True)          #varchar10
    Height = Column(String, nullable=True)          #varchar10
    CreatedOn = Column(DateTime, nullable=False)      #datetime
    LastChanged = Column(DateTime, nullable=False)      #datetime
    LastUsed = Column(DateTime, nullable=True)      #datetime
    Comment = Column(Text, nullable=True)           #text
    Salutation = Column(String, nullable=True)      #varchar6
    DefKrollCare = Column(Boolean, nullable=True)   #bit
    KrollCare = Column(CHAR, nullable=True)         #char1
    SnapRequested = Column(Boolean, nullable=True)  #bit
    SnapDocumented = Column(Boolean, nullable=True) #bit
    LargeSig = Column(Boolean, nullable=True)       #bit
    FirstDrugName = Column(SmallInteger, nullable=True)     #tinyint
    SecondDrugName = Column(SmallInteger, nullable=True)     #tinyint
    DeliveryRoute = Column(CHAR, nullable=True)     #char10
    EMail = Column(String, nullable=True)           #varchar50
    AddressLink = Column(Integer, nullable=True)    #int
    NetworkKeyword = Column(String, nullable=True)  #varchar50
    NHID = Column(Integer, nullable=True)           #int and foreign key
    PharmanetLog = Column(Text, nullable=True)      #text
    NoKrollCare = Column(Boolean, nullable=True)    #bit
    UnitDoseType = Column(SmallInteger, nullable=True)   #smallint
    UnitDoseCycle = Column(SmallInteger, nullable=True) #smallint
    PriceGroup = Column(Integer, nullable=True)
    PrintCompliance = Column(Boolean, nullable=True)
    ARID = Column(Integer, nullable=True)
    NHWardID = Column(Integer, nullable=True)
    NHAdmitDate = Column(DateTime, nullable=True)
    NHDischargeDate = Column(DateTime, nullable=True)
    NHDeceasedDate = Column(DateTime, nullable=True)
    NHRoom = Column(String, nullable=True)
    NHBed = Column(String, nullable=True)
    NHLastTMRDate = Column(DateTime, nullable=True)
    NHInactive = Column(Boolean, nullable=True)
    NHDiet = Column(String, nullable=True)
    NHComment = Column(String, nullable=True)
    AutoRefillStatus = Column(SmallInteger, nullable=True)
    AutoRefillNotification = Column(SmallInteger, nullable=True)
    StoreID = Column(SmallInteger, nullable=True)
    StoreLocal = Column(Boolean, nullable=True)
    LastTMRPrinted = Column(DateTime, nullable=True)
    Active = Column(Boolean, nullable=False)
    UnitDoseStrategyID = Column(Integer, nullable=True)
    NetworkKeywordDate = Column(DateTime, nullable=True)
    DefaultNHCycleId = Column(Integer, nullable=True)
    OCMPin = Column(String, nullable=True)
    IsAnimal = Column(Boolean, nullable=True)
    AnimalType = Column(String, nullable=True)
    NetworkId = Column(String, nullable=True)
    AnimalOwnerPatId = Column(Integer, nullable=True)
    UnitDosePatPrcGrpId = Column(Integer, nullable=True)
    MergedToId = Column(Integer, nullable=True)
    PickupNotificationEnrolment = Column(Integer, nullable=True)
    LanguageSpoken = Column(String, nullable=True)
    DeliveryRouteType = Column(Integer, nullable=True)
    DoubleCount = Column(SmallInteger, nullable=True)
    NetworkIdRoot = Column(String, nullable=True)
    VialIdentifier = Column(String, nullable=True)
    PatType = Column(Integer, nullable=True)
    NetworkSynchronizedDate = Column(DateTime, nullable=True)
    AlternateLastName = Column(String, nullable=True)
    NoWalletCard = Column(Boolean, nullable=True)
    DeliveryRouteTypeMask = Column(Integer, nullable=True)
    RemQtyLabelType = Column(Integer, nullable=True)
    PharmacyLinkFlags = Column(Integer, nullable=True)
    DefaultDeliveryRouteId = Column(Integer, nullable=True)
    DefaultDeliveryRouteServiceId = Column(Integer, nullable=True)
    AddressVerificationFlags = Column(Integer, nullable=True)

    patientLogistics = relationship('Patients', back_populates='krollPatient')
    therapyLogistics = relationship('OpsTherapy', back_populates='krollPatient')

class KrollPatientPhone(Base):
    __tablename__ = 'kroll_patient_phone'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PatID = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    Description = Column(String, nullable=False)        #varchar10
    Phone = Column(String, nullable=False)  # varchar14
    Extension = Column(String, nullable=True)           #varchar8
    LongDistance = Column(Boolean, nullable=False)      #bit
    Type = Column(SmallInteger, nullable=False, default=0)         #smallint
    status = Column(Enum, nullable=True)                #smallint
    DateCreated = Column(DateTime, default=datetime.now)                            #datetime
    DateChanged = Column(DateTime, default=datetime.now, onupdate=datetime.now)     #datetime

class KrollPatientPlan(Base):
    __tablename__ = 'kroll_patient_plan'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PatID = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    Sequence = Column(Integer, nullable=False)          #int
    PlanID = Column(Integer, ForeignKey('kroll_plan.id'), nullable=True)
    SubPlanID = Column(Integer, ForeignKey('kroll_plan_sub.id'), nullable =True)
    Cardholder = Column(String, nullable=True)          #varchar25
    CarrierID = Column(String, nullable=True)           #varchar2
    GroupID = Column(String, nullable=True)             #varchar11
    ClientID = Column(String, nullable=True)            #varchar30
    CPHAPatCode = Column(String, nullable=True)         #varchar3
    Expiry = Column(DateTime, nullable=True)            #datetime
    Rel = Column(String, nullable=True)                 #varchar2
    DeductType = Column(Integer, nullable=True)         #int
    DeductValue = Column(CHAR, nullable=True)           #varchar15
    Comment = Column(Text, nullable=True)               #text
    LinkID = Column(Integer, nullable=True)             #int
    AlwaysUseInRx = Column(Boolean, nullable=True)      #bit
    InterventionCode = Column(String, nullable=True)    #varchar4
    YearlyDeductLimit = Column(Numeric, nullable=True)  #numeric(9,2)
    YearlyDeductAccum = Column(Numeric, nullable=True)  #numeric(9,2)
    YearlyDeductType = Column(Integer, nullable=True)   #int
    YearlyDeductValue = Column(String, nullable=True)   #varchar15
    FirstName = Column(String, nullable=True)           #varchar25
    InactivatedOn = Column(DateTime, nullable=True)     #datetime
    Birthday = Column(DateTime, nullable=True)          #datetime
    PatSex = Column(String, nullable=True)              #varchar1
    LastName = Column(String, nullable=True)            #varchar25
    Deleted = Column(Boolean, nullable=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollPlanSub(Base):
    __tablename__ = 'kroll_plan_sub'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PlanID = Column(Integer, ForeignKey('kroll_plan.id'), nullable=False)
    SubPlanCode = Column(String, nullable=True)                         #varchar10
    DefSubPlan = Column(Boolean, nullable=False, default=False)         #bit
    Description = Column(String, nullable=False, default=False)         #varchar40
    CarrierIDRO = Column(Boolean, nullable=False, default=False)        #bit
    GroupRO = Column(Boolean, nullable=False, default=False)            #bit
    ClientRO = Column(Boolean, nullable=False, default=False)           #bit
    CPHARO = Column(Boolean, nullable=False, default=False)            #bit
    RelRO = Column(Boolean, nullable=False, default=False)             #bit
    ExpiryRO = Column(Boolean, nullable=False, default=False)           #bit
    CarrierIDReq = Column(Boolean, nullable=False, default=False)       #bit
    GroupReq = Column(Boolean, nullable=False, default=False)           #bit
    ClientReq = Column(Boolean, nullable=False, default=False)          #bit
    CPHAReq = Column(Boolean, nullable=False, default=False)            #bit
    RelReq = Column(Boolean, nullable=False, default=False)            #bit
    ExpiryReq = Column(Boolean, nullable=False, default=False)          #bit
    DeductReq = Column(Boolean, nullable=False, default=False)          #bit
    BirthReq = Column(Boolean, nullable=False, default=False)          #bit
    DefaultCarrierID = Column(String, nullable=True)    #varchar2
    DefaultGroupID = Column(String, nullable=True)      #varchar10
    DefaultClientID = Column(String, nullable=True)     #varchar15
    DefaultCPHAPatCode = Column(String, nullable=True)  #varchar3
    MaskCarrierID = Column(String, nullable=True)       #varchar2
    MaskGroupID = Column(String, nullable=True)         #varchar10
    MaskClientID = Column(String, nullable=True)        #varchar15
    MaskCPHAPatCode = Column(String, nullable=True)     #varchar3
    UsePlanPricing = Column(Boolean, nullable=True)     #bit
    UsePlanPatInfo = Column(Boolean, nullable=True)     #bit
    BillingReport = Column(Boolean, nullable=True)      #bit
    Comment = Column(Text, nullable=True)               #text
    CorporateID = Column(String, nullable=True)        #varchar10
    DefaultDeductType = Column(Integer, nullable=True)  #int
    DefaultDeductValue = Column(CHAR, nullable=True)    #varchar15
    ExcludeFromNetworkTotals = Column(Boolean, nullable=True) #bit
    HelpStr = Column(String, nullable=True)             #varchar100
    CardImage = Column(LargeBinary, nullable=True)      #varbinary(max)
    DeferPricingToSecondPlan = Column(Boolean, nullable=True) #bit
    AllowFillIfPlanExpired = Column(Boolean, nullable=True)    #bit
    IgnorePatPrcGrp = Column(Boolean, nullable=True)          #bit
    PromptForDeductWhenBillingManually = Column(Boolean, nullable=True) #bit
    Active = Column(Boolean, nullable=True)                  #bit
    CentralMaintId = Column(Integer, nullable=True)           #int
    CentralMaintFieldMask = Column(Integer, nullable=True)    #int
    DrgPackTierId = Column(Integer, nullable=True)            #int
    DUEOnly = Column(Boolean, nullable=True)                  #bit
    AllowManualBilling = Column(Boolean, nullable=True)       #bit
    TreatAsDUEIfPlanPaysZero = Column(Boolean, nullable=True) #bit
    CouponPercentage = Column(Numeric(precision=9, scale=3), nullable=True)        #numeric(9,3)
    CouponMinimumValue = Column(Numeric(precision=9, scale=3), nullable=True)        #numeric(9,3)
    IsPreferredProviderSubPlan = Column(Boolean, nullable=True) #bit
    DoPreferredProviderSubPlanSubstitution = Column(Boolean, nullable=True) #bit
    IgnoreDrgPrcGrp = Column(Boolean, nullable=True)          #bit
    CentralMaintFieldMask2 = Column(Integer, nullable=True)   #int
    PrintCostBreakdownOnReceipt = Column(Boolean, nullable=True) #bit
    SingleUse = Column(Boolean, nullable=True)          #bit
    GLAccountNumber = Column(String, nullable=True)     #varchar20
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollPlan(Base):
    __tablename__ = 'kroll_plan'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PlanCode = Column(String, nullable=True, default=None)          #varchar10
    Description = Column(String, nullable=True)         #varchar40
    PharmacyID = Column(String, nullable=True)         #varchar11
    Address1 = Column(String, nullable=True)            #varchar40
    Address2 = Column(String, nullable=True)            #varchar40
    City = Column(String, nullable=True)                #varchar25
    Prov = Column(String, nullable=True)               #varchar2
    Postal = Column(String, nullable=True)              #varchar10
    Country = Column(String, nullable=True)            #varchar50
    Contact = Column(String, nullable=True)            #varchar40
    Comment = Column(Text, nullable=True)               #text
    Phone = Column(String, nullable=True)               #varchar14
    Fax = Column(String, nullable=True)                 #varchar14
    AdjHostID = Column(Integer, nullable=True)          #int
    BIN = Column(String, nullable=True)                 #varchar10
    PrimaryRoute = Column(String, nullable=True)       #varchar20
    SecondaryRoute = Column(String, nullable=True)     #varchar20
    ProvincialPlanCode = Column(Integer, nullable=True) #int
    CancelDays = Column(String, nullable=True)         #varchar20
    TrialRx = Column(Boolean, nullable=True)           #bit
    Triplicate = Column(Boolean, nullable=True)        #bit
    PayPatient = Column(Boolean, nullable=True)        #bit
    AlternatePayee = Column(Boolean, nullable=False)     #bit
    DailyDetail = Column(Boolean, nullable=True)       #bit
    DefaultRel = Column(Boolean, nullable=True)         #bit
    MixType = Column(Integer, nullable=True)           #int
    MixDIN = Column(String, nullable=True)             #varchar13
    CheckCoverage = Column(Boolean, nullable=False)     #bit
    UseGlobal = Column(Boolean, nullable=True)          #bit
    FeePerMin = Column(Integer, nullable=True)         #int
    DontChargeMixTimeBelow = Column(Integer, nullable=True) #int
    UpchargeOnMixFeePercent = Column(Integer, nullable=True) #int
    CheckMixCoverage = Column(Boolean, nullable=True)  #bit
    IsProvincialPlan = Column(Boolean, nullable=True)  #bit
    IsRealTime = Column(Boolean, nullable=True)        #bit
    FormularyStrategyID = Column(Integer, nullable=True) #int
    UseAlternateDocNum = Column(Boolean, nullable=True) #bit
    CentralMaintId = Column(Integer, nullable=True)    #int
    CentralMaintFieldMask = Column(Integer, nullable=True) #int
    ClinicalAdjHostId = Column(Integer, nullable=True) #int
    UseAlternatePharmacistId = Column(Boolean, nullable=True) #bit
    SendBCPharmanetSpecialAuthCodes = Column(Boolean, nullable=True) #bit
    CentralMaintFieldMask2 = Column(Integer, nullable=True) #int
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollPatientCom(Base):
    __tablename__ = 'kroll_patient_com'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PatID = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    Topic = Column(String, nullable=True)               #varchar15
    Created = Column(DateTime, nullable=True)           #datetime
    Changed = Column(DateTime, nullable=True)           #datetime
    Comment = Column(LargeBinary, nullable=True)        #varbinary(max)
    ShowOnRx = Column(Boolean, nullable=True)           #bit
    PrintOnHardcopy = Column(Boolean, nullable=True)    #bit
    Conspicuous = Column(Boolean, nullable=True)        #bit
    CeRxRoot = Column(String, nullable=True)            #varchar200
    CeRxExtension = Column(String, nullable=True)       #varchar200
    CreatedFromNetwork = Column(Boolean, nullable=True) #bit
    WorkflowAlerts = Column(String, nullable=True)      #varchar100
    CommentPlainText = Column(String, nullable=True)    #varchar(max)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollPatientCnd(Base):
    __tablename__ = 'kroll_patient_cnd'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PatID = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    Code = Column(String, nullable=True)                #varchar50
    Comment = Column(Text, nullable=True)               #text
    Seq = Column(SmallInteger, nullable=True)           #smallint
    Source = Column(Integer, nullable=True)             #int
    DateAdded = Column(DateTime, nullable=True)         #datetime
    Severity = Column(String, nullable=True)            #varchar4000
    CodeType = Column(Integer, nullable=True)           #int
    CeRxRoot = Column(String, nullable=True)            #varchar200
    CeRxExtension = Column(String, nullable=True)       #varchar200
    CeRxCode = Column(String, nullable=True)            #varchar50
    CeRxCodeSystem = Column(String, nullable=True)      #varchar200
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollPatientAlg(Base):
    __tablename__ = 'kroll_patient_alg'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    PatID = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    Code = Column(String, nullable=False)           #varchar50
    Comment = Column(Text, nullable=True)           #text
    Seq = Column(SmallInteger, nullable=True)       #smallint
    Source = Column(Integer, nullable=True)         #int
    DateAdded = Column(DateTime, nullable=True)     #datetime
    Severity = Column(String, nullable=True)        #varchar4000
    CodeType = Column(Integer, nullable=False)      #int
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollDrug(Base):
    __tablename__ = 'kroll_drug'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    BrandName = Column(String, nullable=False)              #varchar200
    GenericName = Column(String, nullable=True)             #varchar200
    DIN = Column(String, nullable=False)                    #varchar13
    Manufacturer = Column(String, nullable=True)            #varchar100
    Description = Column(String, nullable=True)             #varchar50
    Comment = Column(Text, nullable=True)                   #text
    Active = Column(Boolean, nullable=True)                 #bit
    KrollMaintained = Column(SmallInteger, nullable=True)   #smallint
    Form = Column(String, nullable=True)                    #varchar100
    Strength = Column(String, nullable=True)                #varchar20
    Package = Column(Boolean, nullable=True)                #bit
    Schedule = Column(String, nullable=True)                #varchar10
    Reportable = Column(Boolean, nullable=True)             #bit
    Maintenance = Column(Boolean, nullable=True)            #bit
    ClinicalId = Column(Integer, nullable=True)             #int
    DefaultSig = Column(String, nullable=True)              #varchar200
    LinkedDrug = Column(String, nullable=True)              #varchar20
    LinkMsg = Column(String, nullable=True)                 #varchar20
    LinkMsgSeverity = Column(Integer, nullable=True)        #int
    ProductType = Column(String, nullable=True)             #varchar20
    PriceGroup = Column(Integer, nullable=True)             #int
    ExpiryDays = Column(Integer, nullable=True)             #int
    FollowupDays = Column(SmallInteger, nullable=True)      #smallint
    AutoDispLocation = Column(String, nullable=True)        #varchar200
    Location = Column(String, nullable=True)                #varchar20
    Created = Column(DateTime, nullable=True)               #datetime
    Changed = Column(DateTime, nullable=True)               #datetime
    Purge = Column(DateTime, nullable=True)                 #datetime
    EquivTo = Column(String, nullable=True)                 #varchar50
    OralWritten = Column(SmallInteger, nullable=True)       #smallint
    SubDrgID = Column(Integer, nullable=True)               #int
    KrollID = Column(Integer, nullable=True)                #int
    PrintCompliance = Column(Boolean, nullable=True)        #bit
    IsTrial = Column(Boolean, nullable=True)                #bit
    FirstDrugName = Column(SmallInteger, nullable=True)     #tinyint
    SecondDrugName = Column(SmallInteger, nullable=True)    #tinyint
    IsWardStock = Column(Boolean, nullable=True)            #bit
    IsFlavorRx = Column(Boolean, nullable=True)             #bit
    HalfSizeSig = Column(Boolean, nullable=True)            #bit
    CentralMaintId = Column(Integer, nullable=True)         #int
    CentralMaintFieldMask = Column(Integer, nullable=True)  #int
    InterchangeablePriority = Column(Integer, nullable=True)    #int
    BrandGenericType = Column(Integer, nullable=True)       #int
    TADin = Column(String, nullable=True)                   #varchar13
    DepartmentId = Column(Integer, nullable=True)
    CentralMaintFieldMask2 = Column(Integer, nullable=True)
    ScriptChekImageKey = Column(Integer, nullable=True)
    DrgMessageMastId = Column(Integer, nullable=True)
    EligibleForCoupon = Column(Boolean, nullable=True)
    IsDevice = Column(Boolean, nullable=True)               #bit
    IsImmunization = Column(Boolean, nullable=True)         #bit
    FeeForServiceType = Column(Integer, nullable=True)
    FollowupFeeForServiceType = Column(Integer, nullable=True)
    DinType = Column(Integer, nullable=True)
    DrgFormId = Column(Integer, nullable=True)
    FDBRouteCode = Column(String, nullable=True)
    MergedToId = Column(Integer, nullable=True)
    CentralMaintOverrideFieldMask = Column(Integer, nullable=True)
    CentralMaintAllowOverrideFieldMask = Column(Integer, nullable=True)
    CentralMaintOverrideFieldMask2 = Column(Integer, nullable=True)
    CentralMaintAllowOverrideFieldMask2 = Column(Integer, nullable=True)
    HandlingInstructions = Column(String, nullable=True)
    Description2 = Column(String, nullable=True)
    ShapeId = Column(Integer, nullable=True)
    ColourId1 = Column(Integer, nullable=True)
    ColourId2 = Column(Integer, nullable=True)
    Markings1 = Column(String, nullable=True)
    Markings2 = Column(String, nullable=True)
    RequireLotNumWhenPackaging = Column(Boolean, nullable=True)
    RequireExpiryDateWhenPackaging = Column(Boolean, nullable=True)
    Refrigerated = Column(Boolean, nullable=True)           #bit
    IsMethadone = Column(Boolean, nullable=True)            #bit
    DoubleCount = Column(Boolean, nullable=True)            #bit
    RxSync = Column(Boolean, nullable=True)                 #bit
    UserField1 = Column(String, nullable=True)              #varchar20
    UserField2 = Column(String, nullable=True)              #varchar20
    UserField3 = Column(String, nullable=True)              #varchar20
    DrgType = Column(Integer, nullable=True)                #int
    RefillRemindersAllowed = Column(Integer, nullable=True) #int
    RefillReminderDefault = Column(Integer, nullable=True)  #int
    VaccineCode = Column(String, nullable=True)             #varchar30
    VaccineCodeType = Column(Integer, nullable=True)        #int

class KrollDrugMix(Base):
    __tablename__ = 'kroll_drug_mix'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    Description = Column(String)                            #varchar200
    QuickCode = Column(String)                              #varchar10
    CompEnterType = Column(String)                          #varchar20
    ConvFactor = Column(Numeric(precision=10, scale=2))     #numeric(18,2)
    BatchQty = Column(Numeric(precision=10, scale=2))       #numeric(18,2)
    Schedule = Column(String)                               #varchar10
    Reportable = Column(Boolean)                            #bit
    PriceGroup = Column(Integer)                            #int
    CompoundType = Column(Integer)                          #int
    ActCompP3 = Column(Integer)                             #int
    Instructions = Column(LargeBinary)                      #varbinary(max)
    Created = Column(DateTime)                              #datetime
    Changed = Column(DateTime)                              #datetime
    Purge = Column(DateTime)                                #datetime
    ExpiryDays = Column(Integer)                            #int
    Form = Column(String)                                   #varchar100
    PrntInstrAtFill = Column(Integer)                       #int
    PrntBatchAndFill = Column(Boolean)                      #bit
    ChrgQtyThres1 = Column(Integer)
    ChrgQtyThres2 = Column(Integer)
    ChrgQtyThres3 = Column(Integer)
    ChrgQtyThres4 = Column(Integer)
    ChrgQtyThres5 = Column(Integer)
    ChrgQty1 = Column(Integer)
    ChrgQty2 = Column(Integer)
    ChrgQty3 = Column(Integer)
    ChrgQty4 = Column(Integer)
    ChrgQty5 = Column(Integer)
    LastUsed = Column(DateTime)                              #datetime
    OralWritten = Column(SmallInteger)
    IsMethadone = Column(Boolean)                           #bit
    IsIV = Column(Boolean)                                  #bit
    DrgMixTimeId = Column(Integer)                          #int
    DefaultSig = Column(String)                             #varchar20
    Active = Column(Boolean)                                #bit
    EligibleForCoupon = Column(Boolean)                     #bit
    DrgFormId = Column(Integer)                             #int
    FDBRouteCode = Column(String)                           #varchar2
    MergedToId = Column(Integer)                            #int
    HandlingInstructions = Column(String)                   #varchar500
    RequireLotNumWhenPackaging = Column(Boolean)            #bit
    RequireExpiryDateWhenPackaging = Column(Boolean)        #bit
    RequireIngredientConfirmationWhenPackaging = Column(Boolean)    #bit
    Refrigerated = Column(Boolean)                          #bit
    RefillRemindersAllowed = Column(Integer)                #int
    RefillReminderDefault = Column(Integer)                 #int
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollDrugPack(Base):
    __tablename__ = 'kroll_drug_pack'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    DrgID = Column(Integer, ForeignKey('kroll_drug.id'), nullable=False)
    QuickCode = Column(String, nullable=True)                       #varchar10
    Active = Column(Boolean, nullable=True)                         #bit
    UPC = Column(String, nullable=True)                             #varchar20
    PackSize = Column(Numeric, nullable=False)                      #numeric(9,1)
    PackType = Column(String, nullable=True)                        #varchar40
    PackUnit = Column(String, nullable=True)                        #varchar40
    PackDesc = Column(String, nullable=True)                        #varchar80
    CaseSize = Column(Integer, nullable=True)                       #int
    OrderByCase = Column(Boolean, nullable=True)                    #bit
    OnHandQty = Column(Numeric, nullable=True)                      #numeric(22,3)
    MinOnHandQty = Column(Numeric, nullable=True)                   #numeric(22,1)
    MaxOnHandQty = Column(Numeric, nullable=True)                   #numeric(22,1)
    AcqCost = Column(Numeric, nullable=True)                        #numeric(9,2)
    SellingCost = Column(Numeric, nullable=True)                    #numeric(9,2)
    UserCost1 = Column(Numeric, nullable=True)                      #numeric(9,2)
    UserCost2 = Column(Numeric, nullable=True)                      #numeric(9,2)
    UserCost3 = Column(Numeric, nullable=True)                      #numeric(9,2)
    AcqCostChgdDate = Column(DateTime, nullable=True)               #datetime
    SellingCostChgdDate = Column(DateTime, nullable=True)           #datetime
    UserCost1ChgdDate = Column(DateTime, nullable=True)             #datetime
    UserCost2ChgdDate = Column(DateTime, nullable=True)             #datetime
    UserCost3ChgdDate = Column(DateTime, nullable=True)             #datetime
    LastAcqCost = Column(Numeric, nullable=True)                    #numeric(9,2)
    LastSellingCost = Column(Numeric, nullable=True)                #numeric(9,2)
    LastUserCost1 = Column(Numeric, nullable=True)                  #numeric(9,2)
    LastUserCost2 = Column(Numeric, nullable=True)                  #numeric(9,2)
    LastUserCost3 = Column(Numeric, nullable=True)                  #numeric(9,2)
    Lot = Column(String, nullable=True)                             #varchar20
    Expiry = Column(DateTime, nullable=True)                        #datetime
    InvResetDate = Column(DateTime, nullable=True)                  #datetime
    Created = Column(DateTime, nullable=True)                       #datetime
    Changed = Column(DateTime, nullable=True)                       #datetime
    Purge = Column(DateTime, nullable=True)                         #datetime
    LastUsed = Column(DateTime, nullable=True)                      #datetime
    ExpiryDays = Column(Integer, nullable=True)                     #int
    ForceOrder = Column(Boolean, nullable=True)                     #bit
    DefOrderQty = Column(Numeric, nullable=True)                    #numeric(22,2)
    DisableAutoOrder = Column(Boolean, nullable=True)
    DisableInvAdj = Column(Boolean, nullable=True)
    MinDays = Column(Numeric, nullable=True)
    MaxDays = Column(Numeric, nullable=True)
    MinScripts = Column(Integer, nullable=True)
    AvgRxQty = Column(Numeric, nullable=True)
    AvgDailyUsage = Column(Numeric, nullable=True)
    LastAvgCalcDate = Column(DateTime, nullable=True)
    AcqCostChgdBy = Column(String, nullable=True)
    SellingCostChgdBy = Column(String, nullable=True)
    UserCost1ChgdBy = Column(String, nullable=True)
    UserCost2ChgdBy = Column(String, nullable=True)
    UserCost3ChgdBy = Column(String, nullable=True)
    KrollMaintained = Column(SmallInteger, nullable=True)
    StoreID = Column(SmallInteger, nullable=True)
    BaseOrderingOn = Column(SmallInteger, nullable=True)
    FrontStore = Column(Boolean, nullable=True)
    OrderQtyMultiple = Column(Integer, nullable=True)
    CentralMaintId = Column(Integer, nullable=True)
    CentralMaintFieldMask = Column(Integer, nullable=True)
    DrgPackTierId = Column(Integer, nullable=True)
    DefVendor = Column(Integer, nullable=True)
    CentralMaintOverrideFieldMask = Column(Integer, nullable=True)
    CentralMaintAllowOverrideFieldMask = Column(Integer, nullable=True)
    MaxRxQty = Column(Numeric, nullable=True)
    MinScriptsCalcType = Column(Integer, nullable=True)
    LastCycleCountDate = Column(DateTime, nullable=True)
    AcqCostChgdByUserId = Column(Integer, nullable=True)
    SellingCostChgdByUserId = Column(Integer, nullable=True)
    UserCost1ChgdByUserId = Column(Integer, nullable=True)
    UserCost2ChgdByUserId = Column(Integer, nullable=True)
    UserCost3ChgdByUserId = Column(Integer, nullable=True)
    UserCost4 = Column(Numeric, nullable=True)
    UserCost5 = Column(Numeric, nullable=True)
    UserCost4ChgdDate = Column(DateTime, nullable=True)             #datetime
    UserCost5ChgdDate = Column(DateTime, nullable=True)             #datetime
    LastUserCost4 = Column(Numeric, nullable=True)                  #numeric(9,2)
    LastUserCost5 = Column(Numeric, nullable=True)                  #numeric(9,2)
    UserCost4ChgdBy = Column(String, nullable=True)                 #varchar20
    UserCost5ChgdBy = Column(String, nullable=True)                 #varchar20
    UserCost4ChgdByUserId = Column(Integer, nullable=True)          #int
    UserCost5ChgdByUserId = Column(Integer, nullable=True)          #int
    UseSellingCostGridPrice = Column(Integer, nullable=True)          #int
    UseUserCost1GridPrice = Column(Integer, nullable=True)          #int
    UseUserCost2GridPrice = Column(Integer, nullable=True)          #int
    UseUserCost3GridPrice = Column(Integer, nullable=True)          #int
    UseUserCost4GridPrice = Column(Integer, nullable=True)          #int
    UseUserCost5GridPrice = Column(Integer, nullable=True)          #int
    MarkupPercent = Column(Numeric, nullable=True)                  #numeric(9,3)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollDrugPackInvHist(Base):
    __tablename__ = 'kroll_drug_pack_inv_hist'
    id = Column(Integer, primary_key=True, index=True, nullable=False)
    DrgPackID = Column(Integer, ForeignKey('kroll_drug_pack.id'), nullable=False)
    ChangeType = Column(Integer, nullable=False)                   #int
    User = Column(String, nullable=True)                           #varchar10
    TS = Column(DateTime, nullable=False)                          #datetime
    RxNum = Column(Integer, nullable=True)                         #int
    PONum = Column(String, nullable=True)                         #varchar30
    OldValue = Column(Numeric(precision=22, scale=3), nullable=True)
    NewValue = Column(Numeric(precision=22, scale=3), nullable=True)
    Reason = Column(String, nullable=True)                         #varchar250
    RxWorkflowId = Column(Integer, nullable=True)                  #int
    RxWorkflowPackId = Column(Integer, nullable=True)             #int
    VendorId = Column(Integer, nullable=True)                     #int
    DeltaAcqCost = Column(Numeric(precision=22, scale=4), nullable=True)
    StoreId = Column(SmallInteger, nullable=True)                 #smallint
    CycleCountId = Column(Integer, nullable=True)                 #int
    UserId = Column(Integer, nullable=True)                       #int
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollRxPrescription(Base):
    __tablename__ = 'kroll_rx_prescription'
    id = Column(Integer, index=True, primary_key=True, nullable=False, unique=True, autoincrement=True)
    PatID = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    DrgID = Column(Integer, ForeignKey('kroll_drug.id'), nullable=True)
    MixID = Column(Integer, ForeignKey('kroll_drug_mix.id'), nullable=True)
    DocID = Column(Integer, ForeignKey('kroll_doctor.id'), nullable=False)
    OrigRxNum = Column(Integer, nullable=False)                         #int
    RxNum = Column(Integer, nullable=False, unique=True)                #int
    Init = Column(String, nullable=True)                                #varchar6
    FillDate = Column(DateTime, nullable=False)                         #datetime
    CancelDate = Column(DateTime, nullable=True)                        #datetime
    FirstFillDate = Column(DateTime, nullable=True)                     #datetime
    LastFillDate = Column(DateTime, nullable=True)                      #datetime
    DispQty = Column(Numeric(precision=11, scale=3), nullable=False)    #numeric(11,3)
    NextFillQty = Column(Numeric(precision=11, scale=3), nullable=True) #numeric(11,3)
    AuthQty = Column(Numeric(precision=11, scale=3), nullable=True)     #numeric(11,3)
    RemQty = Column(Numeric(precision=11, scale=3), nullable=True)     #numeric(11,3)
    DaysSupply = Column(SmallInteger, nullable=True)                    #smallint
    Labels = Column(SmallInteger, nullable=True)                        #smallint
    ProductSelection = Column(Integer, nullable=True)
    OralWritten = Column(CHAR, nullable=True)
    SIG = Column(String, nullable=True)                                 #varchar2000
    SigCRC = Column(Integer, nullable=True)
    DIN = Column(String, nullable=False)
    PackSize = Column(Numeric(precision=9, scale=1), nullable=True)     #numeric(9,1)
    AAC = Column(Numeric(precision=9, scale=2), nullable=True)
    Cost = Column(Numeric(precision=9, scale=2), nullable=True)
    Markup = Column(Numeric(precision=9, scale=2), nullable=True)
    Fee = Column(Numeric(precision=9, scale=2), nullable=True)
    MixTime = Column(SmallInteger, nullable=True)
    MixFee = Column(Numeric(precision=9, scale=2), nullable=True)
    SSCFee = Column(Numeric(precision=9, scale=2), nullable=True)
    PriceDiscount = Column(Numeric(precision=9, scale=2), nullable=True)
    DeductDiscount = Column(Numeric(precision=9, scale=2), nullable=True)
    ManualPrice = Column(Boolean, nullable=False)
    TrialRx = Column(Boolean, nullable=True)
    PartialFill = Column(Boolean, nullable=True)
    DrugExpiryDate = Column(DateTime, nullable=True)
    StopDate = Column(DateTime, nullable=True)
    RxExpiryDate = Column(DateTime, nullable=True)
    FollowUpDate = Column(DateTime, nullable=True)
    Status = Column(Integer, nullable=True)
    Lot = Column(String, nullable=True)
    DocAddressLoc = Column(String, nullable=True)
    SplitQty = Column(Boolean, nullable=True)
    SplitEvenly = Column(Boolean, nullable=True)
    LabelQtySplit = Column(String, nullable=True)               #varchar(200)
    AdjState = Column(Integer, nullable=True)
    Inactive = Column(Boolean, nullable=True)
    CopiedTo = Column(Integer, nullable=True)
    CopiedFrom = Column(Integer, nullable=True)
    TherapeuticStartDate = Column(DateTime, nullable=True)
    TransferredFromDate = Column(DateTime, nullable=True)
    TransferredToDate = Column(DateTime, nullable=True)
    ScriptImage = Column(Text, nullable=True)
    DiscountCost = Column(Numeric(precision=9, scale=2), nullable=True)
    DiscountFee = Column(Numeric(precision=9, scale=2), nullable=True)
    DiscountMarkup = Column(Numeric(precision=9, scale=2), nullable=True)
    DiscountMixFee = Column(Numeric(precision=9, scale=2), nullable=True)
    DiscountSSCFee = Column(Numeric(precision=9, scale=2), nullable=True)
    UserInit = Column(CHAR, nullable=False)                     #MG
    UnitDoseStartDate = Column(DateTime, nullable=True)
    WrittenDate = Column(DateTime, nullable=False)              #datetime
    MinIntervalDays = Column(SmallInteger, nullable=True)
    BackDatedOn = Column(DateTime, nullable=True)
    PrcStratID = Column(Integer, nullable=True)
    CorporatePriceID = Column(String, nullable=True)
    Charged = Column(Boolean, nullable=True)
    POSPending = Column(Boolean, nullable=True)
    NHCycle = Column(Integer, nullable=True)
    NHBatchFill = Column(Boolean, nullable=True)
    NHUnitDose = Column(Boolean, nullable=True)
    NHWardStock = Column(Boolean, nullable=True)
    NHMedType = Column(Integer, nullable=True)
    NHExtraMARSpace = Column(Boolean, nullable=True)
    NHEODStartDate = Column(DateTime, nullable=True)
    NHLabels = Column(SmallInteger, nullable=True)
    ScriptImageID = Column(Integer, nullable=True)
    FirstDrugName = Column(SmallInteger, nullable=True)
    SecondDrugName = Column(SmallInteger, nullable=True)
    PrintSigSmall = Column(SmallInteger, nullable=True)
    UnlimitedRefills = Column(Boolean, nullable=True)
    NHComment = Column(String, nullable=True)                   #varchar(200)
    RoboticPending = Column(Boolean, nullable=True)
    NHDaysInUnitDoseCycle = Column(SmallInteger, nullable=True)
    NHCardNum = Column(SmallInteger, nullable=True)
    AutoRefill = Column(SmallInteger, nullable=True)
    NHSplitQty = Column(Boolean, nullable=True)
    NHSplitEvenly = Column(Boolean, nullable=True)
    NHLabelQtySplit = Column(String, nullable=True)             #varchar(200)
    NHBatchUseBatchValues = Column(Boolean, nullable=True)
    NHBatchDailyDosage = Column(Numeric(precision=11, scale=3), nullable=True)     #numeric(9,1)
    NHBatchRegLabels = Column(SmallInteger, nullable=True)
    NHBatchNHLabels = Column(SmallInteger, nullable=True)
    MethadoneIngestDate = Column(DateTime, nullable=True)
    IsHidden = Column(Boolean, nullable=True)
    POSTrigger = Column(Integer, nullable=True)
    NarcRefNum = Column(String, nullable=True)
    IsMistake = Column(Boolean, nullable=True)
    OrderReceived = Column(Boolean, nullable=True)
    StoreID = Column(SmallInteger, nullable=True)
    NHID = Column(Integer, nullable=True)
    NHWardID = Column(Integer, nullable=True)
    RxChangedOn = Column(DateTime, nullable=True)
    DrgPackTierId = Column(Integer, nullable=True)
    WorkOrderId = Column(Integer, nullable=True)
    ForceReportable = Column(Boolean, nullable=True)
    CeRxRxId = Column(String, nullable=True)
    CeRxDispenseId = Column(String, nullable=True)
    UnitDosePrcStratId = Column(Integer, nullable=True)
    Merged = Column(Boolean, nullable=True)
    FeeForServiceType = Column(Integer, nullable=True)
    UserField1 = Column(String, nullable=True)
    LastRxStatus = Column(SmallInteger, nullable=True)
    InactivatedOn = Column(DateTime, nullable=True)
    FDBDosageFormCode = Column(String, nullable=True)
    FDBRouteCode = Column(String, nullable=True)
    PickupNotificationRequested = Column(SmallInteger, nullable=True)
    NHUnitDoseType = Column(Integer, nullable=True)
    NHUnitDoseFreq = Column(Integer, nullable=True)
    NHUnitDoseAnchorDate = Column(DateTime, nullable=True)
    CeRxOrderType = Column(SmallInteger, nullable=True)
    CopiedFromReason = Column(SmallInteger, nullable=True)
    CopiedToReason = Column(SmallInteger, nullable=True)
    WasUndeliverable = Column(Boolean, nullable=True)
    CancelRefillType = Column(Integer, nullable=True)
    NHBatchType = Column(Integer, nullable=True)
    LegacyWorkflow = Column(Boolean, nullable=True)
    CounselingRequired = Column(SmallInteger, nullable=True)
    CounselingResponse = Column(SmallInteger, nullable=True)
    IdentificationRequiredOnDelivery = Column(SmallInteger, nullable=True)
    ScriptImagePosition = Column(SmallInteger, nullable=True)
    ScriptImagePage = Column(SmallInteger, nullable=True)
    ChargeToAR = Column(SmallInteger, nullable=True)
    RxContextInfo = Column(LargeBinary, nullable=True)
    RxContextInfoCompressionType = Column(Integer, nullable=True)
    OrderCreatedFromNetwork = Column(Boolean, nullable=True)
    IsPharmacistPrescribe = Column(Boolean, nullable=True)
    PasstimeCode = Column(String, nullable=True)
    DrugSource = Column(Integer, nullable=True)
    PrescriptiveAuthority = Column(SmallInteger, nullable=True)
    UserId = Column(Integer, nullable=True)
    UserUserId = Column(Integer, nullable=True)
    CounselingReason = Column(SmallInteger, nullable=True)
    AdjLogInfo = Column(LargeBinary, nullable=True)
    AdjLogInfoCompressionType = Column(Integer, nullable=True)
    FillingAdjComplete = Column(Boolean, nullable=True)
    BaseCost = Column(Numeric(precision=9, scale=2), nullable=True)
    CouponValue = Column(Numeric(precision=9, scale=2), nullable=True)
    RxRefillSyncType = Column(Integer, nullable=True)
    ImmunizationId = Column(Integer, nullable=True)
    ImmunizationProductType = Column(Integer, nullable=True)
    DoNotDispenseBeforeDate = Column(DateTime, nullable=True)
    Adapted = Column(Integer, nullable=True)
    MagicNumber = Column(String, nullable=True)
    AdminSites = Column(String, nullable=True)                      #varchar(200)
    MaxDoseQty1 = Column(Numeric(precision=11, scale=3), nullable=True)
    MaxDoseQtyUnit1 = Column(String, nullable=True)
    MaxDoseRange1 = Column(Numeric(precision=11, scale=3), nullable=True)
    MaxDoseRangeUnit1 = Column(String, nullable=True)
    MaxDoseQty2 = Column(Numeric(precision=11, scale=3), nullable=True)
    MaxDoseQtyUnit2 = Column(String, nullable=True)
    MaxDoseRange2 = Column(Numeric(precision=11, scale=3), nullable=True)
    MaxDoseRangeUnit2 = Column(String, nullable=True)
    ManualStructuredDosing = Column(Boolean, nullable=True)
    AdditionalStructuredSig = Column(String, nullable=True)
    CarryNumber = Column(Integer, nullable=True)
    PharmacistPrescribeMedReviewRxId = Column(Integer, nullable=True)
    MaxDispQty = Column(Numeric(precision=11, scale=3), nullable=True)
    TreatmentType = Column(Integer, nullable=True)
    NoDocERenewal = Column(Boolean, nullable=True)
    KrollCareRequested = Column(SmallInteger, nullable=True)
    RefillReminderDate = Column(DateTime, nullable=True)
    LegalAuthorityExpiryDate = Column(DateTime, nullable=True)
    OrigERxOrderId = Column(Integer, nullable=True)
    RefillRemindersAllowed = Column(Integer, nullable=True)
    RenewalReminderDate = Column(DateTime, nullable=True)
    CanDoAutoRefill = Column(Boolean, nullable=True)
    NHDoNotBatchFillBeforeDate = Column(DateTime, nullable=True)
    ARId = Column(Integer, nullable=True)
    CounselingRejectedReason = Column(Integer, nullable=True)
    CounselingAgentType = Column(Integer, nullable=True)
    CFEligibility = Column(Integer, nullable=True)
    CFRefusalReason = Column(String, nullable=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

    __table_args__ = (
        UniqueConstraint('RxNum', name='uq_kroll_rx_prescription_rxnum'),
    )

class KrollRxPrescriptionPlan(Base):
    __tablename__ = 'kroll_rx_prescription_plan'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    Seq = Column(Integer, nullable=True)                         #smallint
    RxNum = Column(Integer, ForeignKey('kroll_rx_prescription.RxNum'), nullable=False)  #int
    PatPlnID = Column(Integer, ForeignKey('kroll_patient_plan.id'), nullable=True)  #int
    Pays = Column(Numeric(precision=10, scale=2), nullable=True)   #numeric(9,2)       #is it False???
    TranType = Column(Integer, nullable=True)                 #smallint       #is it False???
    AdjState = Column(Integer, nullable=True)                  #smallint
    SubPlanCode = Column(String, nullable=True)                     #char10
    IsRT = Column(Boolean, nullable=True)                           #bit
    AdjDate = Column(DateTime, nullable=True)                       #smalldatetime
    SSC = Column(String, nullable=True)                             #varchar5
    SSCFee = Column(Numeric(precision=10, scale=2), nullable=True)  #numeric(9,2)
    SANum = Column(String, nullable=True)
    Interventions = Column(String, nullable=True)
    ReasonCodeRef = Column(String, nullable=True)
    ReasonCode = Column(String, nullable=True)
    StreamData = Column(LargeBinary, nullable=True)
    ClaimType = Column(Integer, nullable=True)
    AdjSendDate = Column(DateTime, nullable=True)
    AdjustmentStatus = Column(Integer, nullable=True)
    PseudoDIN = Column(String, nullable=True)
    AdjudicationLevel = Column(Integer, nullable=True)
    PaymentSeq = Column(Integer, nullable=True)
    NonDUESeq = Column(Integer, nullable=True)
    DiscountSSCFee = Column(Numeric(precision=10, scale=2), nullable=True)
    PseudoDinType = Column(Integer, nullable=True)
    ClaimTypeOverride = Column(Boolean, nullable=True)
    DrgMixFeeMastId = Column(Integer, nullable=True)
    IsClinicalPlan = Column(Boolean, nullable=True)
    CancelsRxPlnId = Column(Integer, nullable=True)
    ModifyInProgress = Column(Boolean, nullable=True)
    CopayStratMastId = Column(Integer, nullable=True)
    CutbackDiscountCost = Column(Numeric(precision=10, scale=2), nullable=True)
    CutbackDiscountMarkup = Column(Numeric(precision=10, scale=2), nullable=True)
    CutbackDiscountFee = Column(Numeric(precision=10, scale=2), nullable=True)
    CutbackDiscountMixFee = Column(Numeric(precision=10, scale=2), nullable=True)
    CutbackDiscountSSCFee = Column(Numeric(precision=10, scale=2), nullable=True)
    CopayDiscountCost = Column(Numeric(precision=10, scale=2), nullable=True)
    CopayDiscountMarkup = Column(Numeric(precision=10, scale=2), nullable=True)
    CopayDiscountFee = Column(Numeric(precision=10, scale=2), nullable=True)
    CopayDiscountMixFee = Column(Numeric(precision=10, scale=2), nullable=True)
    CopayDiscountSSCFee = Column(Numeric(precision=10, scale=2), nullable=True)
    AdjudicationAdjustedBits = Column(Integer, nullable=True)
    SSCOverride = Column(Boolean, nullable=True)
    InterventionsOverride = Column(Boolean, nullable=True)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class KrollRxPrescriptionPlanAdj(Base):
    __tablename__ = 'kroll_rx_prescription_plan_adj'
    id = Column(Integer, primary_key=True, index=True, nullable=False, unique=True, autoincrement=True)
    TS = Column(DateTime, nullable=False)
    RxPlnID = Column(Integer, ForeignKey('kroll_rx_prescription_plan.id'), nullable=False)
    ResultCode = Column(String, nullable=False)
    AdjDate = Column(DateTime, nullable=True)                   #?????
    InterventionCodes = Column(String, nullable=True)
    TraceNum = Column(String, nullable=True)
    RefNum = Column(String, nullable=True)
    ErrorCodes = Column(String, nullable=True)
    Messages = Column(Text, nullable=True)
    Cost = Column(Numeric(precision=10, scale=2), nullable=False)
    Markup = Column(Numeric(precision=10, scale=2), nullable=False)
    Fee = Column(Numeric(precision=10, scale=2), nullable=False)
    MixFee = Column(Numeric(precision=10, scale=2), nullable=False)
    SSCFee = Column(Numeric(precision=10, scale=2), nullable=False)
    PlanPays = Column(Numeric(precision=10, scale=2), nullable=False)
    Request = Column(Text, nullable=True)
    Response = Column(Text, nullable=True)
    SubCost = Column(Numeric(precision=10, scale=2), nullable=False)
    SubMarkup = Column(Numeric(precision=10, scale=2), nullable=False)
    SubFee = Column(Numeric(precision=10, scale=2), nullable=False)
    SubMixFee = Column(Numeric(precision=10, scale=2), nullable=False)
    SubSSCFee = Column(Numeric(precision=10, scale=2), nullable=False)
    PrevPaid = Column(Numeric(precision=10, scale=2), nullable=False)
    SSC = Column(String, nullable=True)
    SANum = Column(String, nullable=True)
    AdjudicationLevel = Column(Integer, nullable=False)
    DIN = Column(String, nullable=True)
    ParserType = Column(Integer, nullable=True)
    RequestCompressionType = Column(Integer, nullable=True)
    ResponseCompressionType = Column(Integer, nullable=True)
    RequestData = Column(LargeBinary, nullable=True)
    ResponseData = Column(LargeBinary, nullable=True)
    TransmissionStatus = Column(Integer, nullable=True)
    RxNum = Column(Integer, nullable=False)
    AdjResponseDate = Column(DateTime, nullable=True)
    RequestEncoding = Column(String, nullable=True)
    ResponseEncoding = Column(String, nullable=True)
    ClaimType = Column(Integer, nullable=True)
    ClaimResult = Column(Integer, nullable=True)
    AdjRouteId = Column(Integer, nullable=True)
    Copay = Column(Numeric, nullable=False)
    Deductible = Column(Numeric, nullable=False)
    CoInsurance = Column(Numeric, nullable=False)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)

class Payment(Base):
    __tablename__ = 'payments'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    payment_date = Column(DateTime, default=datetime.now, nullable=False)
    payment_method = Column(String, nullable=False)  # credit, check, direct_deposit
    reference_number = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    patient = relationship('KrollPatient', backref='payments')

class Invoice(Base):
    __tablename__ = 'invoices'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    invoice_date = Column(DateTime, default=datetime.now, nullable=False)
    due_date = Column(DateTime, nullable=False)
    total_amount = Column(Numeric(precision=10, scale=2), nullable=False)
    amount_paid = Column(Numeric(precision=10, scale=2), default=0)
    status = Column(String, default='pending')  # pending, paid, partial, overdue
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Relationships
    patient = relationship('KrollPatient', backref='invoices')
    invoice_items = relationship('InvoiceItem', backref='invoice')

class InvoiceItem(Base):
    __tablename__ = 'invoice_items'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    rx_plan_adj_id = Column(Integer, ForeignKey('kroll_rx_prescription_plan_adj.id'), nullable=True)
    description = Column(String, nullable=False)
    amount = Column(Numeric(precision=10, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

class PaymentInvoice(Base):
    __tablename__ = 'payment_invoices'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    payment_id = Column(Integer, ForeignKey('payments.id'), nullable=False)
    invoice_id = Column(Integer, ForeignKey('invoices.id'), nullable=False)
    amount_applied = Column(Numeric(precision=10, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    payment = relationship('Payment', backref='payment_invoices')
    invoice = relationship('Invoice', backref='payment_invoices')

class MonthlyStatement(Base):
    __tablename__ = 'monthly_statements'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    patient_id = Column(Integer, ForeignKey('kroll_patient.id'), nullable=False)
    statement_date = Column(DateTime, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    opening_balance = Column(Numeric(precision=10, scale=2), nullable=False)
    total_charges = Column(Numeric(precision=10, scale=2), nullable=False)
    total_payments = Column(Numeric(precision=10, scale=2), nullable=False)
    closing_balance = Column(Numeric(precision=10, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.now)
    
    # Relationships
    patient = relationship('KrollPatient', backref='monthly_statements')

class FinancialStatement(Base):
    __tablename__ = 'financial_statements'
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    statement_date = Column(DateTime, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    total_revenue = Column(Numeric(precision=12, scale=2), nullable=False)
    insurance_payments = Column(Numeric(precision=12, scale=2), nullable=False)
    patient_payments = Column(Numeric(precision=12, scale=2), nullable=False)
    outstanding_balance = Column(Numeric(precision=12, scale=2), nullable=False)
    created_at = Column(DateTime, default=datetime.now)

