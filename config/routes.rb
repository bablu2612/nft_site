Rails.application.routes.draw do
  root "homes#homepage"
  get "nft_collection",to: "homes#nft_collection"
  get "create_nft",to: "homes#create_nft"
  get "edit_nft", to: "homes#edit_nft"
  get "nft_detail", to: "homes#nft_detail"
  get "profile",to: "homes#profile"
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
