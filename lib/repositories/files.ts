import {
  documents as mockDocuments,
  driveFolders as mockDriveFiles,
  sheets as mockSheets,
} from "@/lib/mock-data";
import { getCurrentWorkspaceId } from "@/lib/repositories/workspace";
import { getSupabase } from "@/lib/supabase";
import type {
  DocumentItem,
  DriveFile,
  DriveItemKind,
  DriveSource,
  SheetItem,
} from "@/lib/types";

interface DriveFileRow {
  id: string;
  name: string;
  kind: string;
  file_type: string;
  owner_name: string;
  source: string;
  starred: boolean;
  trashed: boolean;
  modified_at: string;
}

interface DocumentRow {
  id: string;
  title: string;
  owner_name: string;
  updated_at: string;
  document_admin_releases?: { profile_id: string }[];
}

interface SheetRow {
  id: string;
  title: string;
  owner_name: string;
  updated_at: string;
}

const driveKinds = new Set<DriveItemKind>(["folder", "file"]);
const driveSources = new Set<DriveSource>([
  "meu-drive",
  "compartilhados",
  "recentes",
]);

function asDriveKind(value: string): DriveItemKind {
  return driveKinds.has(value as DriveItemKind)
    ? (value as DriveItemKind)
    : "file";
}

function asDriveSource(value: string): DriveSource {
  return driveSources.has(value as DriveSource)
    ? (value as DriveSource)
    : "meu-drive";
}

function mapDriveFile(row: DriveFileRow): DriveFile {
  return {
    id: row.id,
    name: row.name,
    kind: asDriveKind(row.kind),
    fileType: row.file_type,
    owner: row.owner_name,
    source: asDriveSource(row.source),
    starred: row.starred,
    trashed: row.trashed,
    modifiedAt: row.modified_at,
  };
}

function mapDocument(row: DocumentRow): DocumentItem {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner_name,
    updatedAt: row.updated_at,
    releasedAdminIds: (row.document_admin_releases ?? []).map((release) => release.profile_id),
  };
}

function mapSheet(row: SheetRow): SheetItem {
  return {
    id: row.id,
    title: row.title,
    owner: row.owner_name,
    updatedAt: row.updated_at,
  };
}

async function requireWorkspaceId(): Promise<string> {
  const workspaceId = await getCurrentWorkspaceId();
  if (!workspaceId) {
    throw new Error("Usuario autenticado nao esta vinculado a um workspace.");
  }
  return workspaceId;
}

export async function listDriveFiles(): Promise<DriveFile[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockDriveFiles;
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("drive_files")
    .select(
      "id, name, kind, file_type, owner_name, source, starred, trashed, modified_at"
    )
    .eq("workspace_id", workspaceId)
    .order("modified_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapDriveFile(row as DriveFileRow));
}

let mockDocumentStore: DocumentItem[] = [...mockDocuments];

export async function listDocuments(): Promise<DocumentItem[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return [...mockDocumentStore];
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("documents")
    .select("id, title, owner_name, updated_at, document_admin_releases(profile_id)")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapDocument(row as DocumentRow));
}

export async function releaseDocumentToAdmin(
  documentId: string,
  profileId: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    mockDocumentStore = mockDocumentStore.map((document) =>
      document.id === documentId && !document.releasedAdminIds.includes(profileId)
        ? { ...document, releasedAdminIds: [...document.releasedAdminIds, profileId] }
        : document
    );
    return;
  }

  const { error } = await supabase
    .from("document_admin_releases")
    .insert({ document_id: documentId, profile_id: profileId });

  if (error) throw error;
}

export async function unreleaseDocumentFromAdmin(
  documentId: string,
  profileId: string
): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) {
    mockDocumentStore = mockDocumentStore.map((document) =>
      document.id === documentId
        ? {
            ...document,
            releasedAdminIds: document.releasedAdminIds.filter((id) => id !== profileId),
          }
        : document
    );
    return;
  }

  const { error } = await supabase
    .from("document_admin_releases")
    .delete()
    .eq("document_id", documentId)
    .eq("profile_id", profileId);

  if (error) throw error;
}

export async function listSheets(): Promise<SheetItem[]> {
  const supabase = getSupabase();

  if (!supabase) {
    return mockSheets;
  }

  const workspaceId = await requireWorkspaceId();
  const { data, error } = await supabase
    .from("sheets")
    .select("id, title, owner_name, updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapSheet(row as SheetRow));
}
