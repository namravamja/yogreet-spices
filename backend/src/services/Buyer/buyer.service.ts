import { Buyer } from "../../models/Buyer";
import { Address } from "../../models/Address";
import mongoose from "mongoose";

export interface BuyerUpdateData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  gender?: string;
}

export const getBuyerById = async (id: string) => {
  const buyer = await Buyer.findById(id)
    .select("-password")
    .populate("addresses")
    .lean();

  if (!buyer) throw new Error("Buyer not found");

  const buyerWithAddresses = buyer as typeof buyer & { addresses?: any[] };

  return {
    ...buyer,
    id: buyer._id.toString(),
    addresses: buyerWithAddresses.addresses || [],
  };
};

export const updateBuyer = async (id: string, data: BuyerUpdateData) => {
  const buyer = await Buyer.findByIdAndUpdate(id, { $set: data }, { new: true })
    .select("-password")
    .populate("addresses")
    .lean();

  if (!buyer) throw new Error("Buyer not found");

  const buyerWithAddresses = buyer as typeof buyer & { addresses?: any[] };

  return {
    ...buyer,
    id: buyer._id.toString(),
    addresses: buyerWithAddresses.addresses || [],
  };
};

// Address operations
export interface AddressCreateData {
  firstName: string;
  lastName: string;
  company?: string;
  street?: string;
  apartment?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressUpdateData {
  firstName?: string;
  lastName?: string;
  company?: string;
  street?: string;
  apartment?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  isDefault?: boolean;
}

export const getBuyerAddresses = async (buyerId: string) => {
  const addresses = await Address.find({
    userId: new mongoose.Types.ObjectId(buyerId),
  })
    .sort({ isDefault: -1, createdAt: -1 })
    .lean();

  return addresses.map((addr) => ({
    ...addr,
    id: addr._id.toString(),
  }));
};

export const createAddress = async (
  buyerId: string,
  data: AddressCreateData
) => {
  // If this address is set as default, unset all other default addresses
  if (data.isDefault) {
    await Address.updateMany(
      { userId: new mongoose.Types.ObjectId(buyerId), isDefault: true },
      { $set: { isDefault: false } }
    );
  }

  const address = await Address.create({
    ...data,
    userId: new mongoose.Types.ObjectId(buyerId),
  });

  return {
    ...address.toObject(),
    id: address._id.toString(),
  };
};

export const updateAddress = async (
  buyerId: string,
  addressId: string | number,
  data: AddressUpdateData
) => {
  // If this address is set as default, unset all other default addresses
  if (data.isDefault === true) {
    await Address.updateMany(
      {
        userId: new mongoose.Types.ObjectId(buyerId),
        isDefault: true,
        _id: { $ne: new mongoose.Types.ObjectId(addressId) },
      },
      { $set: { isDefault: false } }
    );
  }

  const address = await Address.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(addressId.toString()),
      userId: new mongoose.Types.ObjectId(buyerId),
    },
    { $set: data },
    { new: true }
  ).lean();

  if (!address) throw new Error("Address not found");

  return {
    ...address,
    id: address._id.toString(),
  };
};

export const deleteAddress = async (buyerId: string, addressId: string | number) => {
  await Address.findOneAndDelete({
    _id: new mongoose.Types.ObjectId(addressId.toString()),
    userId: new mongoose.Types.ObjectId(buyerId),
  });
};

export const setDefaultAddress = async (buyerId: string, addressId: string | number) => {
  // First, unset all default addresses
  await Address.updateMany(
    { userId: new mongoose.Types.ObjectId(buyerId), isDefault: true },
    { $set: { isDefault: false } }
  );

  // Then set the specified address as default
  const address = await Address.findOneAndUpdate(
    {
      _id: new mongoose.Types.ObjectId(addressId.toString()),
      userId: new mongoose.Types.ObjectId(buyerId),
    },
    { $set: { isDefault: true } },
    { new: true }
  ).lean();

  if (!address) throw new Error("Address not found");

  return {
    ...address,
    id: address._id.toString(),
  };
};
