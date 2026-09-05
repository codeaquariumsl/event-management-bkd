import { CompanyProfileModel, ServiceCatalogModel } from '../models/CompanyProfile.js';

export const getCompanyProfile = async (req, res) => {
  try {
    let profile = await CompanyProfileModel.findOne();
    if (!profile) {
      profile = new CompanyProfileModel({
        name: 'Seekers’s Entertainment (pvt) Ltd',
        tagline: 'Premier Audio-Visual Production, DJ & Event Technology',
        email: 'ops@seekersentertainment.lk',
        phone: `+94 71 035 87 23 (Voice / WhatsApp)
+94 76 468 00 00
+971 54 544 66 09 (UAE)`,
        address: 'No. 42, Independence Avenue, Colombo 07, Sri Lanka',
        taxNumber: 'TIN-109482710-8000',
        businessRegistration: 'PV-0028941',
        currency: 'LKR',
        bankName: 'BOC bank',
        bankAccount: '94630427',
        bankBranch: 'Walgama',
        invoiceTerms: `* Payment method can be cash, bank transfer.
* Payment must be made in full without deducting any tax.
* Transportation, handling, food, labor charges, are included in this rate.
* Make all checks payable to “ Seekers’s Entertainment (pvt) Ltd”`,
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
    const services = await ServiceCatalogModel.find().sort({ sortOrder: 1, createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service catalog from database', error });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await ServiceCatalogModel.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found in database' });
    }
    res.json(service);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service item', error });
  }
};

export const createService = async (req, res) => {
  try {
    let newId = req.body.id;
    if (!newId) {
      const allServices = await ServiceCatalogModel.find({}, 'id');
      let maxNum = 0;
      allServices.forEach((s) => {
        if (s.id && s.id.startsWith('srv-')) {
          const num = parseInt(s.id.replace('srv-', ''), 10);
          if (!isNaN(num) && num > maxNum) {
            maxNum = num;
          }
        }
      });
      newId = `srv-${maxNum + 1}`;
    }

    const service = new ServiceCatalogModel({
      ...req.body,
      id: newId,
    });
    const saved = await service.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: 'Error creating service item in database', error });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await ServiceCatalogModel.findOne({ id: req.params.id });
    if (!service) {
      return res.status(404).json({ message: 'Service not found in database' });
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
    const filtered = distinctCategories.filter(Boolean);
    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service categories from database', error });
  }
};

export const getServicePresets = async (req, res) => {
  try {
    const realPresets = await ServiceCatalogModel.find({ isActive: true })
      .sort({ sortOrder: 1, createdAt: -1 })
      .limit(10);
    res.json(realPresets);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service presets from database', error });
  }
};

export const deleteService = async (req, res) => {
  try {
    const result = await ServiceCatalogModel.findOneAndDelete({ id: req.params.id });
    if (!result) {
      return res.status(404).json({ message: 'Service not found in database' });
    }
    res.json({ message: 'Service deleted successfully', success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service item', error });
  }
};
