FactoryGirl.define do 
  factory :user do
      sequence(:email){|n| "email#{n}@factory.com" }
      password "foobar"
      password_confirmation "foobar"
    end
    
    factory :map do
      content '{"nodes":[{"scalelevel":1,"color":"#00f","position":{"x":628.6273803710938,"y":455},"size":{"w":100,"h":60},"text":"Mappa di test\n","radius":10,"guid":"c77c0127-7865-9721-b2db-9d5fb209a049","isroot":true},{"scalelevel":1,"color":"#bf0000","position":{"x":386,"y":297},"size":{"w":70,"h":40},"text":"My node","radius":10,"guid":"889db3d0-7e14-fc58-6ead-504fcab963a6","parentGUID":"c77c0127-7865-9721-b2db-9d5fb209a049"},{"scalelevel":1,"color":"#bf5600","position":{"x":336,"y":442},"size":{"w":70,"h":40},"text":"My node","radius":10,"guid":"35aa855d-0c13-2741-378d-c74e0afb4b3d","parentGUID":"c77c0127-7865-9721-b2db-9d5fb209a049"},{"scalelevel":1,"color":"#bf0000","position":{"x":254,"y":222},"size":{"w":70,"h":40},"text":"My node","radius":10,"guid":"6be52e16-b499-c939-df5c-924bb2545743","parentGUID":"889db3d0-7e14-fc58-6ead-504fcab963a6"},{"scalelevel":1,"color":"#bf0000","position":{"x":256,"y":297},"size":{"w":70,"h":40},"text":"My node","radius":10,"guid":"1a338a0f-713a-e379-b45c-b25078c5575e","parentGUID":"889db3d0-7e14-fc58-6ead-504fcab963a6"},{"scalelevel":1,"color":"#bf0000","position":{"x":141,"y":168},"size":{"w":70,"h":40},"text":"Test 3\n","radius":10,"guid":"5bd87b5e-d418-ea93-fe28-dae46bdfa3b2","parentGUID":"6be52e16-b499-c939-df5c-924bb2545743"},{"scalelevel":1,"color":"#bfac00","position":{"x":985.8825073242188,"y":171},"size":{"w":70,"h":40},"text":"Sottonodo\n","radius":10,"guid":"08b3c541-fb65-af98-2f51-adaed9d59038","parentGUID":"c77c0127-7865-9721-b2db-9d5fb209a049"}],"connections":{}}'
      title 'My test maps'
      association :user
    end
    
    factory :attachment do
      association  :map
      kind 'wiki'
      node_uuid '114714bb-b861-0a51-e7ef-24c57f04c835'
      sequence(:content) {|n| "this the n. #{n} cool *strongly emphasized* paragraph with _Textile_"}
    end
end


