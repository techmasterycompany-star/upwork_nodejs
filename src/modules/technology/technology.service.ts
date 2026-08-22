import TechnologySchema from "../../models/technology.model.js";

export const getAlltech = async () => {
  const technologies = await TechnologySchema.find();
  return technologies;
};
export const createTech = async (data: any) => {
  const technologies = await TechnologySchema.create(data);
  return technologies;
};
export const updateTech = async (data: any, id: string) => {
  const technologies = await TechnologySchema.findByIdAndUpdate(
    {
      _id: id,
    },
    data,
    { new: true },
  );
  return technologies;
};
export const deleteTech = async ( id: string) => {
  const technologies = await TechnologySchema.findByIdAndDelete(
    {
      _id: id,
    },
  );
  return technologies;
};
