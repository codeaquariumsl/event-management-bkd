import { CompanyProfileModel, ServiceCatalogModel } from '../models/CompanyProfile.js';

export const getCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfileModel.findOne();
    if (!profile) {
      profile = new CompanyProfileModel({
        name: 'Seekers Entertainment (Pvt) Ltd',
        tagline: 'Premier Audio-Visual Production, DJ & Event Technology',
        email: 'ops@seekersentertainment.lk',
        phone: '+94 11 258 4930',
        address: 'No. 42, Independence Avenue, Colombo 07, Sri Lanka',
        taxNumber: 'TIN-109482710-8000',
        businessRegistration: 'PV-0028941',
        currency: 'LKR',
        bankName: 'Commercial Bank of Ceylon',
        bankAccount: '1000 4829 5501',
        bankBranch: 'Colombo 07 Premier Branch',
        invoiceTerms: '50% advance upon confirmation. Remaining balance due within 24 hours of event completion.',
      });
      await profile.save();
    }
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching company profile', error });
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfileModel.findOne();
    if (!profile) {
      profile = new CompanyProfileModel(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    const saved = await profile.save();
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error updating company profile', error });
  }
};

const DEFAULT_SERVICES = [
  {
    id: 'srv-1',
    name: 'Full Wedding Audio & Atmosphere Package',
    category: 'Sound',
    description: 'Complete high-fidelity sound reinforcement with wireless mics and warm ambience lighting for luxury receptions.',
    unitPrice: 180000,
    duration: '6 Hours',
    features: ['Line Array Sound System', 'Wireless Microphones x4', 'Atmospheric Moving Head Lighting', 'Dedicated Sound Engineer', 'Backup Power Support'],
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'srv-2',
    name: 'Club Night & EDM Concert DJ Rig',
    category: 'DJ',
    description: 'Industry-standard Pioneer DJ setup, club subwoofers, lasers, and high-energy stage lighting.',
    unitPrice: 140000,
    duration: '8 Hours',
    features: ['Pioneer CDJ-3000 & DJM-900NXS2', 'Subwoofer Stacks 4x 18"', 'Laser Beam Projection', 'Haze & Co2 Jet System', 'Resident DJ Included'],
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'srv-3',
    name: 'Corporate Gala Intelligent Lighting Truss',
    category: 'Lighting',
    description: 'Dynamic computer-controlled moving heads, stage pin-spots, and perimeter wireless uplighting.',
    unitPrice: 110000,
    duration: '5 Hours',
    features: ['16x Beam/Spot Moving Heads', '24x Wireless LED Uplighters', 'GrandMA Lighting Console Control', 'Custom Company Logo Gobo Projection'],
    isActive: true,
    sortOrder: 3,
  },
  {
    id: 'srv-4',
    name: 'P3.9 High-Definition Outdoor LED Video Wall',
    category: 'LED',
    description: 'Ultra-bright modular LED screen panels with video scaler for live camera feeds and visuals.',
    unitPrice: 220000,
    duration: 'Per Event',
    features: ['16ft x 9ft P3.9 High Refresh Panels', 'Novastar 4K Video Processor', 'Live Camera Feed Switcher', 'Heavy Duty Truss Ground Support'],
    isActive: true,
    sortOrder: 4,
  },
  {
    id: 'srv-5',
    name: 'Acoustic Stage & Band Live Production',
    category: 'Production',
    description: 'Full backline, multitrack mixing console, stage monitor wedges, and instrument mic array.',
    unitPrice: 165000,
    duration: 'Per Event',
    features: ['32-Channel Digital Stage Box', 'In-Ear Monitoring Sets x5', 'Full Drum & Instrument Microphone Kit', 'Stage Risers & Black Velvet Drapes'],
    isActive: true,
    sortOrder: 5,
  },
  {
    id: 'srv-6',
    name: 'Special FX Sparkular & Low Fog Package',
    category: 'Special FX',
    description: 'Cold-spark machines (100% indoor safe with zero smoke/fire alarm trigger) and ground-hugging dry ice fog.',
    unitPrice: 65000,
    duration: 'Per Event',
    features: ['4x Cold Sparkular Machines', 'Heavy Low-Fog Dry Ice Machine', 'Synchronized First Dance Triggering', 'Certified Pyro Technician'],
    isActive: true,
    sortOrder: 6,
  },
];

export const getServices = async (req, res) => {
  try {
    let services = await ServiceCatalogModel.find().sort({ sortOrder: 1, createdAt: -1 });
    if (!services || services.length === 0) {
      await ServiceCatalogModel.insertMany(DEFAULT_SERVICES);
      services = await ServiceCatalogModel.find().sort({ sortOrder: 1, createdAt: -1 });
    }
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service catalog', error });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await ServiceCatalogModel.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service item', error });
  }
};

export const createService = async (req, res) => {
  try {
    const count = await ServiceCatalogModel.countDocuments();
    const newId = req.body.id || `srv-${count + 1}`;

    const service = new ServiceCatalogModel({
      ...req.body,
      id: newId,
    });
    const saved = await service.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service item', error });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await ServiceCatalogModel.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found' });
    }

    Object.assign(service, req.body);
    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating service item', error });
  }
};

export const getServiceCategories = async (req, res) => {
  try {
    const distinctCategories = await ServiceCatalogModel.distinct('category');
    const baseCategories = ['Sound', 'DJ', 'Lighting', 'LED', 'Production', 'Special FX'];
    const combined = Array.from(new Set([...baseCategories, ...distinctCategories])).filter(Boolean);
    res.json(combined);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service categories', error });
  }
};

export const getServicePresets = async (req, res) => {
  try {
    res.json(DEFAULT_SERVICES);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service presets', error });
  }
};

export const deleteService = async (req, res) => {
  try {
    const result = await ServiceCatalogModel.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ message: 'Service not found' });
    }
    res.json({ message: 'Service deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service item', error });
  }
};


