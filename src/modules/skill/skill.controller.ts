import { Request, Response } from "express";
import * as skillService from "./skill.service.js";

export const readAllSkills = async (req: Request, res: Response) => {
  const skills = await skillService.getAllSkills();
  res.status(200).json({ success: true, data: skills });
};

export const createNewSkill = async (req: Request, res: Response) => {
  const skill = await skillService.createSkill(req.body);
  res.status(201).json({
    success: true,
    message: "Skill added successfully",
    data: skill,
  });
};

export const updateSkillById = async (req: Request, res: Response) => {
  const skill = await skillService.updateSkill(
    req.params.id as string,
    req.body,
  );
  res.status(200).json({
    success: true,
    message: "Skill updated successfully",
    data: skill,
  });
};

export const deleteSkillById = async (req: Request, res: Response) => {
  const skill = await skillService.deleteSkill(req.params.id as string);
  res.status(200).json({
    success: true,
    message: "Skill deleted successfully",
    data: skill,
  });
};
