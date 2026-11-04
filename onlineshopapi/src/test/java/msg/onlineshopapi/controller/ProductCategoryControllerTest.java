package msg.onlineshopapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import msg.onlineshopapi.config.TestSecurityConfig;
import msg.onlineshopapi.dto.ProductCategoryDto;
import msg.onlineshopapi.dto.mapper.ProductCategoryMapper;
import msg.onlineshopapi.exception.ResourceNotFoundException;
import msg.onlineshopapi.model.ProductCategory;
import msg.onlineshopapi.security.JwtService;
import msg.onlineshopapi.service.ProductCategoryService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(ProductCategoryController.class)
@Import(TestSecurityConfig.class)
class ProductCategoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @MockitoBean
    private ProductCategoryService productCategoryService;

    @MockitoBean
    private ProductCategoryMapper productCategoryMapper;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private UserDetailsService userDetailsService;

    private final UUID categoryId = UUID.randomUUID();

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getAll_returnsCategories() throws Exception {
        ProductCategory category = ProductCategory.builder().id(categoryId).name("Electronics").build();
        ProductCategoryDto dto = categoryDto(categoryId, "Electronics");

        when(productCategoryService.findAll()).thenReturn(List.of(category));
        when(productCategoryMapper.toDto(category)).thenReturn(dto);

        mockMvc.perform(get("/products/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(categoryId.toString()))
                .andExpect(jsonPath("$[0].name").value("Electronics"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getById_returnsCategory_whenFound() throws Exception {
        ProductCategory category = ProductCategory.builder().id(categoryId).name("Electronics").build();
        ProductCategoryDto dto = categoryDto(categoryId, "Electronics");

        when(productCategoryService.findById(categoryId)).thenReturn(Optional.of(category));
        when(productCategoryMapper.toDto(category)).thenReturn(dto);

        mockMvc.perform(get("/products/categories/{id}", categoryId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(categoryId.toString()))
                .andExpect(jsonPath("$.name").value("Electronics"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void getById_returns404_whenNotFound() throws Exception {
        when(productCategoryService.findById(categoryId)).thenReturn(Optional.empty());

        mockMvc.perform(get("/products/categories/{id}", categoryId))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void create_returnsCategory_whenAdmin() throws Exception {
        ProductCategoryDto request = ProductCategoryDto.builder()
                .name("Electronics").description("Electronic devices").build();
        ProductCategory entity = ProductCategory.builder().name("Electronics").build();
        ProductCategory saved = ProductCategory.builder().id(categoryId).name("Electronics").build();
        ProductCategoryDto dto = categoryDto(categoryId, "Electronics");

        when(productCategoryMapper.toEntity(any(ProductCategoryDto.class))).thenReturn(entity);
        when(productCategoryService.save(entity)).thenReturn(saved);
        when(productCategoryMapper.toDto(saved)).thenReturn(dto);

        mockMvc.perform(post("/products/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(categoryId.toString()))
                .andExpect(jsonPath("$.name").value("Electronics"));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void create_returns403_whenNotAdmin() throws Exception {
        ProductCategoryDto request = ProductCategoryDto.builder()
                .name("Electronics").description("Electronic devices").build();

        mockMvc.perform(post("/products/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void update_returnsCategory_whenAdmin() throws Exception {
        ProductCategoryDto request = ProductCategoryDto.builder()
                .name("Updated Electronics").description("Updated description").build();
        ProductCategory entity = ProductCategory.builder().name("Updated Electronics").build();
        ProductCategory updated = ProductCategory.builder().id(categoryId).name("Updated Electronics").build();
        ProductCategoryDto dto = categoryDto(categoryId, "Updated Electronics");

        when(productCategoryMapper.toEntity(any(ProductCategoryDto.class))).thenReturn(entity);
        when(productCategoryService.update(eq(categoryId), eq(entity))).thenReturn(updated);
        when(productCategoryMapper.toDto(updated)).thenReturn(dto);

        mockMvc.perform(put("/products/categories/{id}", categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Electronics"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void update_returns404_whenCategoryNotFound() throws Exception {
        ProductCategoryDto request = ProductCategoryDto.builder()
                .name("Electronics").description("Electronic devices").build();
        ProductCategory entity = ProductCategory.builder().name("Electronics").build();

        when(productCategoryMapper.toEntity(any(ProductCategoryDto.class))).thenReturn(entity);
        when(productCategoryService.update(eq(categoryId), eq(entity)))
                .thenThrow(new ResourceNotFoundException("Category not found with id: " + categoryId));

        mockMvc.perform(put("/products/categories/{id}", categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Category not found with id: " + categoryId));
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void update_returns403_whenNotAdmin() throws Exception {
        ProductCategoryDto request = ProductCategoryDto.builder()
                .name("Electronics").description("Electronic devices").build();

        mockMvc.perform(put("/products/categories/{id}", categoryId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void delete_returns204_whenAdmin() throws Exception {
        doNothing().when(productCategoryService).deleteById(categoryId);

        mockMvc.perform(delete("/products/categories/{id}", categoryId))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "CUSTOMER")
    void delete_returns403_whenNotAdmin() throws Exception {
        mockMvc.perform(delete("/products/categories/{id}", categoryId))
                .andExpect(status().isForbidden());
    }

    private ProductCategoryDto categoryDto(UUID id, String name) {
        return ProductCategoryDto.builder()
                .id(id)
                .name(name)
                .description("Test description")
                .build();
    }
}
