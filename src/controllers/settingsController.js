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

export const getServices = async (req, res) => {
  try {
    const services = await ServiceCatalogModel.find().sort({ unitPrice: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service catalog', error });
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
