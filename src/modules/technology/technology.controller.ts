import { Request, Response } from "express";
import { success } from "zod";
import {
  createTech,
  deleteTech,
  getAlltech,
  updateTech,
} from "./technology.service.js";

export const readAllTechnologies = async (req: Request, res: Response) => {
  const technologies = await getAlltech();
  res.status(200).json({
    success: true,
    data: technologies,
  });
};
export const createNewTechnologies = async (req: Request, res: Response) => {
  const technologies = await createTech(req.body);
  res.status(200).json({
    success: true,
    message: "technologie added successfully",
    data: technologies,
  });
};
export const updateTechnologie = async (req: Request, res: Response) => {
  const techid = req.params.id as string;
  const technologies = await updateTech(req.body, techid);
  res.status(200).json({
    success: true,
    message: "technologie updated successfully",
    data: technologies,
  });
};
export const deleteTechnologie = async (req: Request, res: Response) => {
  const techid = req.params.id as string;
  const technologies = await deleteTech(techid);
  res.status(200).json({
    success: true,
    message:"Technologie deleted successfully",
    data: technologies,
  });
};
