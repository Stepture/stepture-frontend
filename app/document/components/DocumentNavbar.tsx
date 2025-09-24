"use client";
import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  back_arrow,
  edit_icon,
  link_share,
  arrow_share,
  nav_save,
  stepture,
  nav_saved,
} from "@/public/constants/images";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import CustomButton from "@/components/ui/Common/CustomButton";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import ShareExportModal from "./ShareExportModal";
import { apiClient } from "@/lib/axios-client";
import { CaptureResponse } from "@/app/document/document.types";
import { AxiosError } from "axios";
import { showToast } from "@/components/ui/Common/ShowToast";

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
  const [savedStatus, setSavedStatus] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const saveDocument = async () => {
    if (params.id && typeof params.id === "string") {
      try {
        await apiClient.protected.saveDocument(params.id);
        setSavedStatus(true); // Update saved status after successful save
        showToast("success", "Document saved successfully.");
      } catch (_error) {
        console.error("Error saving document:", _error);
        showToast("error", "Failed to save the document.");
      }
    }
  };

  const unsaveDocument = async () => {
    console.log("Unsave document called");
    if (params.id && typeof params.id === "string") {
      try {
        await apiClient.protected.unsaveDocument(params.id);
        setSavedStatus(false);
        showToast("success", "Document unsaved successfully.");
      } catch (_error) {
        console.error("Error unsaving document:", _error);
        showToast("error", "Failed to unsave the document.");
      }
    }
  };

  const checkSavedStatus = useCallback(async () => {
    if (params.id && typeof params.id === "string") {
      try {
        const response = await apiClient.protected.checkSavedStatus(params.id);
        return response.isSaved;
      } catch (error) {
        console.error("Error checking saved status:", error);
        return false;
      }
    }
    return false;
  }, [params.id]);

  useEffect(() => {
    const fetchDataAndStatus = async () => {
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

          const isSaved = await checkSavedStatus();
          setSavedStatus(isSaved);
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

    fetchDataAndStatus();
  }, [params.id, checkSavedStatus]);

  // Close mobile menu when clicking outside or on menu items
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="bg-white shadow-sm w-full relative">
      <nav className="flex items-center justify-between p-4 text-slate-700 max-w-[1200px] mx-auto">
        {/* Left side - Back/Logo */}
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
            onClick={closeMobileMenu}
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
            onClick={closeMobileMenu}
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

        {/* Desktop Menu - Right side */}
        <div className="hidden md:flex items-center gap-2">
          {isLoading ? (
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

              <CustomButton
                icon={!savedStatus ? nav_save : nav_saved}
                variant="secondary"
                onClick={!savedStatus ? saveDocument : unsaveDocument}
                label={savedStatus ? "Saved" : "Save"}
              />
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
          ) : null}
        </div>

        {/* Mobile Hamburger Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors relative z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-6 w-6 text-slate-700 stroke-2" />
          ) : (
            <Menu className="h-6 w-6 text-slate-700 stroke-2" />
          )}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed top-0 left-0 right-0 bottom-0 z-40">
          {/* Blurred backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
            onClick={closeMobileMenu}
          />

          {/* Menu content */}
          <div className="relative backdrop-blur-lg shadow-2xl border-b mt-[72px]">
            <div className="p-2 space-y-4">
              {isLoading ? (
                <div className="space-y-3">
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
              ) : !isLoggedIn ? (
                <div className="w-full">
                  <CustomButton
                    label="Login to Stepture"
                    variant="primary"
                    size="medium"
                    onClick={() => {
                      router.push("/login");
                      closeMobileMenu();
                    }}
                  />
                </div>
              ) : isOwner ? (
                <div className="space-y-4">
                  {mode !== "edit" && (
                    <div className="w-full">
                      <CustomButton
                        label="Edit"
                        icon={edit_icon}
                        variant="secondary"
                        size="medium"
                        onClick={() => {
                          const id = params.id;
                          router.push(`/document/${id}?mode=edit`);
                          closeMobileMenu();
                        }}
                      />
                    </div>
                  )}
                  <hr />

                  <div className="w-full">
                    <CustomButton
                      label="Share"
                      icon={arrow_share}
                      icon2={link_share}
                      variant="primary"
                      size="medium"
                      onClick={() => {
                        setIsShareModalOpen(true);
                        closeMobileMenu();
                      }}
                    />
                  </div>
                  <hr />

                  <div className="w-full">
                    <CustomButton
                      icon={!savedStatus ? nav_save : nav_saved}
                      variant="secondary"
                      size="medium"
                      onClick={!savedStatus ? saveDocument : unsaveDocument}
                      label={savedStatus ? "Saved" : "Save"}
                    />
                  </div>
                </div>
              ) : captures && captures.isPublic ? (
                // Logged-in non-owner with public document: can see Share and Save buttons
                <div className="space-y-4">
                  <div className="w-full">
                    <CustomButton
                      label="Share"
                      icon={arrow_share}
                      icon2={link_share}
                      variant="primary"
                      size="medium"
                      onClick={() => {
                        setIsShareModalOpen(true);
                        closeMobileMenu();
                      }}
                    />
                  </div>
                  <div className="w-full">
                    <CustomButton
                      icon={nav_save}
                      variant="secondary"
                      size="medium"
                      label="Save"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

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
