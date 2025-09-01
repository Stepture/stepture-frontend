"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  back_arrow,
  edit_icon,
  link_share,
  arrow_share,
  nav_save,
  stepture,
} from "@/public/constants/images";
import Image from "next/image";
import CustomButton from "@/components/ui/Common/CustomButton";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ShareExportModal from "./ShareExportModal";
import { apiClient } from "@/lib/axios-client";
import { CaptureResponse } from "@/app/document/document.types";
import { AxiosError } from "axios";

const DocumentNavbar = () => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "view";
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [captures, setCaptures] = useState<CaptureResponse | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (params.id && typeof params.id === "string") {
        setIsLoading(true);

        let user = null;
        let loggedIn = false;
        try {
          const userData = await apiClient.protected.getMe();
          user = userData.user;
          loggedIn = !!user;
          setIsLoggedIn(loggedIn);
        } catch (userError: unknown) {
          console.error("Error fetching user:", userError);
          // Only set logged in to false for authentication errors (401)
          if (
            userError instanceof AxiosError &&
            userError.response?.status === 401
          ) {
            setIsLoggedIn(false);
            loggedIn = false;
          }
        }

        // Then, try to fetch the document based on authentication status
        try {
          let response;
          if (loggedIn) {
            // Use protected endpoint for authenticated users
            response = await apiClient.protected.getDocumentById(params.id);
          } else {
            // Use public endpoint for non-authenticated users
            response = await apiClient.public.getDocumentById(params.id);
          }
          setCaptures(response);

          const owner = loggedIn && user && user.userId === response.user.id;
          setIsOwner(owner);
        } catch (docError: unknown) {
          console.log("Error fetching document:", docError);
          setCaptures(null);
          setIsOwner(false);

          // If document fetch fails and user is not logged in,
          // it could be a private document requiring authentication
          // if (!loggedIn && docError?.response?.status === 400) {
          //   // Document is private and user needs to log in
          //   console.log("Document is private or requires authentication");
          // } else if (loggedIn && docError?.response?.status === 400) {
          //   // Even logged in user can't access this document
          //   console.log(
          //     "Document not found or access denied for logged in user"
          //   );
          // }
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [params.id]);

  return (
    <header className="bg-white shadow-sm w-full">
      <nav className="flex items-center justify-between p-4 text-slate-700 max-w-[1200px] mx-auto">
        {isLoading ? (
          // Loading skeleton for left side
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : isLoggedIn ? (
          // Dashboard link for logged-in users
          <Link
            href="/dashboard/created"
            className="flex items-center text-slate-400 text-sm hover:scale-110 transition-ease-in duration-400"
          >
            <Image
              src={back_arrow}
              alt="Back Arrow"
              width={24}
              height={24}
              className="mr-2"
            />
            Document
          </Link>
        ) : (
          // Stepture logo for non-logged-in users
          <Link
            href="/"
            className="flex items-center text-slate-700 hover:scale-105 transition-ease-in duration-400"
          >
            <Image
              src={stepture}
              alt="Stepture"
              width={24}
              height={24}
              className="mr-2"
            />
            Stepture
          </Link>
        )}
        <div className="flex items-center">
          {
            isLoading ? (
              // Loading skeleton
              <div className="flex items-center gap-2">
                <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : !isLoggedIn ? (
              // Non-logged-in users: only "Login to Stepture" button
              <CustomButton
                label="Login to Stepture"
                variant="primary"
                size="small"
                onClick={() => router.push("/login")}
              />
            ) : isOwner ? (
              // Owner: can see Edit, Share, and Save buttons
              <>
                {mode !== "edit" && (
                  <CustomButton
                    label="Edit"
                    icon={edit_icon}
                    variant="secondary"
                    size="small"
                    onClick={() => {
                      const id = params.id;
                      router.push(`/document/${id}?mode=edit`);
                    }}
                  />
                )}
                <CustomButton
                  label="Share"
                  icon={arrow_share}
                  icon2={link_share}
                  variant="primary"
                  size="small"
                  onClick={() => setIsShareModalOpen(true)}
                />
                <CustomButton icon={nav_save} variant="secondary" />
              </>
            ) : captures && captures.isPublic ? (
              // Logged-in non-owner with public document: can see Share and Save buttons
              <>
                <CustomButton
                  label="Share"
                  icon={arrow_share}
                  icon2={link_share}
                  variant="primary"
                  size="small"
                  onClick={() => setIsShareModalOpen(true)}
                />
                <CustomButton icon={nav_save} variant="secondary" />
              </>
            ) : null
            // Logged-in non-owner with private document: no action buttons (only left navigation shows)
          }
        </div>
      </nav>

      {/* Share Export Modal */}
      <ShareExportModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        documentTitle={captures?.title || "Document"}
        documentId={typeof params.id === "string" ? params.id : undefined}
        captures={captures || undefined}
        isOwner={isOwner}
      />
    </header>
  );
};

export default DocumentNavbar;
